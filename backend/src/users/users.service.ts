import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email }, relations: ['role'] });
  }

  async findById(id: string): Promise<User> {
    const u = await this.usersRepo.findOne({ where: { id }, relations: ['role'] });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.rolesRepo.findOne({ where: { name } });
  }

  async listRoles(): Promise<Role[]> {
    return this.rolesRepo.find({ order: { name: 'ASC' } });
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepo.findOne({ where: { name: dto.name } });
    if (existing) return existing;
    const role = this.rolesRepo.create({ name: dto.name, description: dto.description });
    return this.rolesRepo.save(role);
  }

  async listUsers() {
    const users = await this.usersRepo.find({ relations: ['role'], order: { createdAt: 'DESC' } });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      role: u.role?.name || null,
      isActive: u.isActive,
      createdAt: u.createdAt
    }));
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const role = await this.rolesRepo.findOne({ where: { name: dto.roleName } });
    if (!role) {
      throw new BadRequestException('Role not found');
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
    return {
      id: saved.id,
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      role: role.name
    };
  }
}
