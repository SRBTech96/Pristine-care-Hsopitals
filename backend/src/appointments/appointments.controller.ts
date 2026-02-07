import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { Ownership } from '../common/decorators/ownership.decorator';
import { Auditable } from '../common/decorators/audit.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto, CancelAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Ownership({ entity: 'appointments', idParam: 'id', ownerField: 'patient_id' })
  @Auditable({ entityType: 'appointments', idParam: 'id', accessType: 'view' })
  async getAppointment(@Param('id') id: string) {
    return this.appointmentsService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable({ entityType: 'appointments', accessType: 'create', resourceType: 'appointments' })
  async createAppointment(@Body() dto: CreateAppointmentDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.appointmentsService.create(dto, user.id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Ownership({ entity: 'appointments', idParam: 'id', ownerField: 'patient_id' })
  @Auditable({ entityType: 'appointments', idParam: 'id', accessType: 'update' })
  async updateAppointment(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    return this.appointmentsService.updateConsultationNotes(id, dto, user.id);
  }

  @Delete(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Ownership({ entity: 'appointments', idParam: 'id', ownerField: 'patient_id' })
  @Auditable({ entityType: 'appointments', idParam: 'id', accessType: 'delete' })
  async cancelAppointment(
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    return this.appointmentsService.cancel(id, dto, user.id);
  }
}
