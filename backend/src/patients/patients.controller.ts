import { Controller, Get, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { Ownership } from '../common/decorators/ownership.decorator';
import { Auditable } from '../common/decorators/audit.decorator';
import { PatientsService } from './patients.service';
import { GetPatientParamsDto } from './dto/get-patient.params.dto';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Ownership({ entity: 'patients', idParam: 'id', ownerField: 'user_id' })
  @Auditable({ entityType: 'patients', idParam: 'id', accessType: 'view' })
  async getPatient(@Param() params: GetPatientParamsDto) {
    return this.patientsService.findById(params.id);
  }
}
