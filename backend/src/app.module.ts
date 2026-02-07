import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { CrmModule } from './crm/crm.module';
import { HrModule } from './hr/hr.module';
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
      entities: [User, Role, UserSession, AuditLog, DataAccessLog, require('./entities/patient.entity').Patient, require('./entities/appointment.entity').Appointment, require('./entities/doctor.entity').Doctor, require('./entities/doctor-availability-slot.entity').DoctorAvailabilitySlot, require('./entities/patient-lead.entity').PatientLead, require('./entities/follow-up.entity').FollowUp, require('./entities/visit-attribution.entity').VisitAttribution, require('./entities/discount-approval.entity').DiscountApproval, require('./entities/hr-employee.entity').HrEmployee, require('./entities/salary-structure.entity').SalaryStructure, require('./entities/payroll-record.entity').PayrollRecord, require('./entities/hr-leave-record.entity').HrLeaveRecord, require('./entities/hr-offer-letter.entity').HrOfferLetter, require('./entities/revenue-record.entity').RevenueRecord, require('./entities/expense-record.entity').ExpenseRecord, require('./entities/pharmacy-inventory.entity').PharmacyInventory, require('./entities/pharmacy-batch.entity').PharmacyBatch, require('./entities/pharmacy-purchase.entity').PharmacyPurchase, require('./entities/pharmacy-sale.entity').PharmacySale],
      synchronize: false,
      logging: false
    }),
    TypeOrmModule.forFeature([DataAccessLog, AuditLog]),
    AuthModule,
    UsersModule,
    AuditModule,
    PatientsModule,
    AppointmentsModule,
    DoctorsModule,
    CrmModule,
    HrModule,
    // Finance & Accounts
    require('./finance/finance.module').FinanceModule
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor }]
})
export class AppModule {}
