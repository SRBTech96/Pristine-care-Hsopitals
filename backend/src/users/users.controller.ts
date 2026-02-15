import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async listUsers() {
    return this.usersService.listUsers();
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get('roles')
  async listRoles() {
    return this.usersService.listRoles();
  }

  @Post('roles')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRole(@Body() dto: CreateRoleDto) {
    return this.usersService.createRole(dto);
  }
}
