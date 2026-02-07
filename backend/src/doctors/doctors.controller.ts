import { Controller, Get, Param, UseGuards, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Auditable } from '../common/decorators/audit.decorator';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  /**
   * GET /api/doctors/:id
   * Get doctor profile by doctor ID
   * Accessible to: PATIENT (to view), DOCTOR (self), ADMIN
   */
  @Get(':id')
  @Auditable({ entityType: 'doctors', idParam: 'id', accessType: 'view' })
  async getDoctorProfile(@Param('id') id: string) {
    return this.doctorsService.findById(id);
  }

  /**
   * GET /api/doctors/:id/availability
   * Get all availability slots for a doctor
   * Accessible to: PATIENT (booking), DOCTOR (self), ADMIN
   */
  @Get(':id/availability')
  @Auditable({ entityType: 'doctors', idParam: 'id', accessType: 'view', resourceType: 'availability_slots' })
  async getAvailability(@Param('id') id: string) {
    return this.doctorsService.getAvailabilitySlots(id);
  }

  /**
   * GET /api/doctors/:id/availability?dayOfWeek=1
   * Get availability slots for a specific day of week (0=Sunday, 6=Saturday)
   * Accessible to: PATIENT (booking), DOCTOR (self), ADMIN
   */
  @Get(':id/availability/day')
  @Auditable({ entityType: 'doctors', idParam: 'id', accessType: 'view', resourceType: 'availability_slots' })
  async getAvailabilityByDay(@Param('id') id: string, @Query('dayOfWeek') dayOfWeek: string) {
    const day = parseInt(dayOfWeek, 10);
    if (isNaN(day) || day < 0 || day > 6) {
      return { error: 'Invalid dayOfWeek (0-6)' };
    }
    return this.doctorsService.getAvailableSlotsForDay(id, day);
  }

  /**
   * GET /api/doctors/department/:departmentId
   * List all available doctors in a department
   * Accessible to: PATIENT (booking), ADMIN
   */
  @Get('department/:departmentId')
  @Auditable({ entityType: 'doctors', accessType: 'list', resourceType: 'doctors' })
  async getDoctorsByDepartment(@Param('departmentId') departmentId: string) {
    return this.doctorsService.findByDepartment(departmentId);
  }
}
