import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PublicAppointmentsService } from './public-appointments.service';
import { PublicAppointmentRequestDto } from './dto/public-appointment-request.dto';

@Controller('public/appointments')
export class PublicAppointmentsController {
  constructor(private publicAppointmentsService: PublicAppointmentsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: PublicAppointmentRequestDto) {
    return this.publicAppointmentsService.createRequest(dto);
  }
}
