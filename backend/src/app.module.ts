import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserSession } from './entities/user-session.entity';
import { AuditLog } from './entities/audit-log.entity';
import { DataAccessLog } from './entities/data-access-log.entity';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

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
      entities: [User, Role, UserSession, AuditLog, DataAccessLog, require('./entities/patient.entity').Patient, require('./entities/appointment.entity').Appointment],
      synchronize: false,
      logging: false
    }),
    TypeOrmModule.forFeature([DataAccessLog, AuditLog]),
    AuthModule,
    UsersModule,
    AuditModule,
    PatientsModule,
    AppointmentsModule
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor }]
})
export class AppModule {}
