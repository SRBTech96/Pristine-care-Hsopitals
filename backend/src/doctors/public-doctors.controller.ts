import { Controller, Get, Param, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service';

@Controller('public/doctors')
export class PublicDoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  async listPublicDoctors(
    @Query('departmentId') departmentId?: string,
    @Query('specializationId') specializationId?: string
  ) {
    return this.doctorsService.listPublicDoctors({ departmentId, specializationId });
  }

  @Get(':id/availability')
  async getAvailability(@Param('id') id: string) {
    return this.doctorsService.getAvailabilitySlots(id);
  }

  @Get(':id/availability/day')
  async getAvailabilityByDay(@Param('id') id: string, @Query('dayOfWeek') dayOfWeek: string) {
    const day = parseInt(dayOfWeek, 10);
    if (isNaN(day) || day < 0 || day > 6) {
      return { error: 'Invalid dayOfWeek (0-6)' };
    }
    return this.doctorsService.getAvailableSlotsForDay(id, day);
  }
}
