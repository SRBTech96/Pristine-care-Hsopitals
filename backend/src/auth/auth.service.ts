import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';

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

  async validateUser(email: string, plainPassword: string): Promise<User | null> {
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

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name || 'UNKNOWN'
    };
  }

  async bootstrapAdmin(dto: BootstrapAdminDto) {
    const expected = process.env.BOOTSTRAP_ADMIN_SECRET;
    if (!expected || dto.secret !== expected) {
      throw new UnauthorizedException('Invalid bootstrap secret');
    }

    const existingAdminCount = await this.usersRepo
      .createQueryBuilder('u')
      .innerJoin('u.role', 'r')
      .where('r.name = :name', { name: 'ADMIN' })
      .getCount();

    if (existingAdminCount > 0) {
      throw new BadRequestException('Admin already exists');
    }

    let role = await this.usersService.getRoleByName('ADMIN');
    if (!role) {
      role = await this.usersService.createRole({ name: 'ADMIN', description: 'System administrator' });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      role,
      isActive: true
    });

    const saved = await this.usersRepo.save(user);
    return { id: saved.id, email: saved.email, role: role.name };
  }
}
