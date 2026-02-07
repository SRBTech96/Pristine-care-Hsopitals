import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserSession } from './entities/user-session.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'pristine',
      password: process.env.DATABASE_PASSWORD || 'change-me',
      database: process.env.DATABASE_NAME || 'pristine_hospital',
      entities: [User, Role, UserSession, AuditLog],
      synchronize: false,
      logging: false
    }),
    AuthModule,
    UsersModule
  ]
})
export class AppModule {}
