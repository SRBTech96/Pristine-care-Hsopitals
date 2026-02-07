import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

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
}
