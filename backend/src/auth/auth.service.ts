import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserSession) private sessionsRepo: Repository<UserSession>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async validateUser(email: string, plainPassword: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const ok = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!ok) return null;
    if (!user.isActive) throw new UnauthorizedException('User inactive');
    return user;
  }

  async login(user: User, ip?: string, userAgent?: string) {
    const payload = { sub: user.id, role: user.role?.name };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // default 7d rotation; controlled by env in production

    const session = this.sessionsRepo.create({
      user,
      tokenHash,
      ipAddress: ip,
      userAgent,
      expiresAt
    });
    await this.sessionsRepo.save(session);

    await this.auditRepo.save({
      entityType: 'users',
      entityId: user.id,
      action: 'LOGIN',
      actorId: user.id,
      actorRole: user.role?.name || 'UNKNOWN',
      severity: 'info'
    } as AuditLog);

    return { accessToken, refreshToken, expiresAt };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.sessionsRepo.findOne({ where: { tokenHash }, relations: ['user', 'user.role'] });
    if (!session) throw new UnauthorizedException('Invalid refresh token');
    if (session.revokedAt) throw new UnauthorizedException('Session revoked');
    if (session.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expired');

    // rotate refresh token
    const newRefresh = crypto.randomBytes(64).toString('hex');
    session.tokenHash = this.hashToken(newRefresh);
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await this.sessionsRepo.save(session);

    const payload = { sub: session.user.id, role: session.user.role?.name };
    const accessToken = this.jwtService.sign(payload);

    await this.auditRepo.save({
      entityType: 'user_sessions',
      entityId: session.id,
      action: 'REFRESH',
      actorId: session.user.id,
      actorRole: session.user.role?.name || 'UNKNOWN',
      severity: 'info'
    } as AuditLog);

    return { accessToken, refreshToken: newRefresh, expiresAt: session.expiresAt };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.sessionsRepo.findOne({ where: { tokenHash }, relations: ['user', 'user.role'] });
    if (!session) return false;
    session.revokedAt = new Date();
    await this.sessionsRepo.save(session);
    await this.auditRepo.save({
      entityType: 'user_sessions',
      entityId: session.id,
      action: 'LOGOUT',
      actorId: session.user.id,
      actorRole: session.user.role?.name || 'UNKNOWN',
      severity: 'info'
    } as AuditLog);
    return true;
  }
}
