import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { NurseStationService } from './nurse-station.service';
import {
  NurseAssignmentDto,
  UpdateNurseAssignmentDto,
  NurseAssignmentResponseDto,
} from './dto/nurse-assignment.dto';
import {
  InpatientAdmissionDto,
  UpdateInpatientAdmissionDto,
  InpatientAdmissionResponseDto,
} from './dto/inpatient-admission.dto';
import {
  CreateDoctorOrderDto,
  DoctorOrderResponseDto,
} from './dto/doctor-order.dto';
import {
  MedicationScheduleDto,
  UpdateMedicationScheduleDto,
  MedicationScheduleResponseDto,
} from './dto/medication-schedule.dto';
import {
  ExecuteMedicationDto,
  SkipMedicationDto,
  MedicationAdministrationResponseDto,
} from './dto/medication-administration.dto';
import {
  RecordVitalsDto,
  VitalsRecordResponseDto,
} from './dto/vitals-record.dto';
import {
  RaiseEmergencyEventDto,
  EmergencyEventResponseDto,
} from './dto/emergency-event.dto';

@ApiTags('Nurse Station')
@ApiBearerAuth()
@Controller('api/nurse-station')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class NurseStationController {
  constructor(private readonly nurseStationService: NurseStationService) {}

  // ===== NURSE ASSIGNMENTS =====

  @Post('assignments')
  @Roles('HEAD_NURSE')
  @Auditable('create')
  @ApiOperation({ summary: 'Assign nurses to ward/floor (HEAD_NURSE only)' })
  @ApiResponse({ status: 201, type: NurseAssignmentResponseDto })
  async createNurseAssignment(
    @Body() dto: NurseAssignmentDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.createNurseAssignment(dto, user.id);
  }

  @Get('assignments')
  @Roles('HEAD_NURSE', 'STAFF_NURSE', 'DOCTOR')
  @ApiOperation({ summary: 'List nurse assignments (filtered by ward/nurse)' })
  @ApiResponse({ status: 200, type: [NurseAssignmentResponseDto] })
  async listNurseAssignments(
    @Query('wardId') wardId?: string,
    @Query('nurseId') nurseId?: string,
  ) {
    return this.nurseStationService.listNurseAssignments(wardId, nurseId);
  }

  @Patch('assignments/:id')
  @Roles('HEAD_NURSE')
  @Auditable('update')
  @ApiOperation({ summary: 'Update nurse assignment (HEAD_NURSE only)' })
  @ApiResponse({ status: 200, type: NurseAssignmentResponseDto })
  async updateNurseAssignment(
    @Param('id') id: string,
    @Body() dto: UpdateNurseAssignmentDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.updateNurseAssignment(id, dto, user.id);
  }

  // ===== INPATIENT ADMISSIONS =====

  @Post('admissions')
  @Roles('HEAD_NURSE', 'DOCTOR')
  @Auditable('create')
  @ApiOperation({ summary: 'Admit patient to bed (HEAD_NURSE, DOCTOR)' })
  @ApiResponse({ status: 201, type: InpatientAdmissionResponseDto })
  async createInpatientAdmission(
    @Body() dto: InpatientAdmissionDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.createInpatientAdmission(dto, user.id);
  }

  @Get('admissions')
  @Roles('HEAD_NURSE', 'STAFF_NURSE', 'DOCTOR')
  @ApiOperation({ summary: 'List inpatient admissions (with optional filters)' })
  @ApiResponse({ status: 200, type: [InpatientAdmissionResponseDto] })
  async listInpatientAdmissions(
    @Query('wardId') wardId?: string,
    @Query('status') status?: string,
    @Query('isIcu') isIcu?: boolean,
    @Query('isNicu') isNicu?: boolean,
  ) {
    return this.nurseStationService.listInpatientAdmissions({
      wardId,
      status,
      isIcu,
      isNicu,
    });
  }

  @Get('admissions/:id')
  @Roles('HEAD_NURSE', 'STAFF_NURSE', 'DOCTOR')
  @ApiOperation({ summary: 'Get admission details' })
  @ApiResponse({ status: 200, type: InpatientAdmissionResponseDto })
  async getInpatientAdmission(@Param('id') id: string) {
    return this.nurseStationService.getInpatientAdmission(id);
  }

  @Patch('admissions/:id/discharge')
  @Roles('HEAD_NURSE', 'DOCTOR')
  @Auditable('update')
  @ApiOperation({ summary: 'Discharge patient (HEAD_NURSE, DOCTOR)' })
  @ApiResponse({ status: 200, type: InpatientAdmissionResponseDto })
  async dischargePatient(
    @Param('id') id: string,
    @Body() dto: UpdateInpatientAdmissionDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.dischargePatient(id, dto, user.id);
  }

  // ===== DOCTOR ORDERS =====

  @Post('doctor-orders')
  @Roles('DOCTOR')
  @Auditable('create')
  @ApiOperation({ summary: 'Create doctor order (DOCTOR only)' })
  @ApiResponse({ status: 201, type: DoctorOrderResponseDto })
  async createDoctorOrder(
    @Body() dto: CreateDoctorOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.createDoctorOrder(dto, user.id);
  }

  @Get('doctor-orders')
  @Roles('DOCTOR', 'HEAD_NURSE', 'STAFF_NURSE')
  @ApiOperation({ summary: 'List doctor orders (by admission, with optional status/type filters)' })
  @ApiResponse({ status: 200, type: [DoctorOrderResponseDto] })
  async listDoctorOrders(
    @Query('admissionId') admissionId: string,
    @Query('status') status?: string,
    @Query('orderType') orderType?: string,
  ) {
    return this.nurseStationService.listDoctorOrders(admissionId, {
      status,
      orderType,
    });
  }

  @Get('doctor-orders/:id')
  @Roles('DOCTOR', 'HEAD_NURSE', 'STAFF_NURSE')
  @ApiOperation({ summary: 'Get doctor order details' })
  @ApiResponse({ status: 200, type: DoctorOrderResponseDto })
  async getDoctorOrder(@Param('id') id: string) {
    return this.nurseStationService.getDoctorOrder(id);
  }

  // ===== MEDICATION SCHEDULES =====

  @Post('medication-schedules')
  @Roles('DOCTOR')
  @Auditable('create')
  @ApiOperation({ summary: 'Create medication schedule for doctor order (DOCTOR only)' })
  @ApiResponse({ status: 201, type: MedicationScheduleResponseDto })
  async createMedicationSchedule(
    @Body() dto: MedicationScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.createMedicationSchedule(dto, user.id);
  }

  @Get('medication-schedules')
  @Roles('DOCTOR', 'HEAD_NURSE', 'STAFF_NURSE')
  @ApiOperation({ summary: 'List medication schedules for admission (with optional status filter)' })
  @ApiResponse({ status: 200, type: [MedicationScheduleResponseDto] })
  async listMedicationSchedules(
    @Query('admissionId') admissionId: string,
    @Query('status') status?: string,
  ) {
    return this.nurseStationService.listMedicationSchedules(admissionId, {
      status,
    });
  }

  // ===== MEDICATION ADMINISTRATION =====

  @Post('medication-administration/execute')
  @Roles('STAFF_NURSE')
  @Auditable('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record medication administration (STAFF_NURSE only)' })
  @ApiResponse({ status: 201, type: MedicationAdministrationResponseDto })
  async executeMedication(
    @Body() dto: ExecuteMedicationDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.executeMedication(dto, user.id);
  }

  @Post('medication-administration/skip')
  @Roles('STAFF_NURSE')
  @Auditable('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Skip medication administration (refused/held/not_given)',
  })
  @ApiResponse({ status: 201, type: MedicationAdministrationResponseDto })
  async skipMedication(
    @Body() dto: SkipMedicationDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.skipMedication(dto, user.id);
  }

  @Get('medication-administration/:id')
  @Roles('DOCTOR', 'HEAD_NURSE', 'STAFF_NURSE')
  @ApiOperation({ summary: 'Get medication administration record' })
  @ApiResponse({ status: 200, type: MedicationAdministrationResponseDto })
  async getMedicationAdministration(@Param('id') id: string) {
    return this.nurseStationService.getMedicationAdministration(id);
  }

  // ===== VITAL SIGNS =====

  @Post('vital-signs')
  @Roles('STAFF_NURSE')
  @Auditable('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record patient vital signs (STAFF_NURSE only)' })
  @ApiResponse({ status: 201, type: VitalsRecordResponseDto })
  async recordVitals(
    @Body() dto: RecordVitalsDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.recordVitals(dto, user.id);
  }

  @Get('vital-signs')
  @Roles('DOCTOR', 'HEAD_NURSE', 'STAFF_NURSE')
  @ApiOperation({ summary: 'List vital signs for patient admission' })
  @ApiResponse({ status: 200, type: [VitalsRecordResponseDto] })
  async listPatientVitals(@Query('admissionId') admissionId: string) {
    return this.nurseStationService.listPatientVitals(admissionId);
  }

  // ===== EMERGENCY EVENTS =====

  @Post('emergency-events')
  @Roles('STAFF_NURSE')
  @Auditable('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Raise emergency event (STAFF_NURSE only)' })
  @ApiResponse({ status: 201, type: EmergencyEventResponseDto })
  async raiseEmergencyEvent(
    @Body() dto: RaiseEmergencyEventDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.raiseEmergencyEvent(dto, user.id);
  }

  @Get('emergency-events')
  @Roles('DOCTOR', 'HEAD_NURSE', 'STAFF_NURSE')
  @ApiOperation({ summary: 'List emergency events (with optional filters)' })
  @ApiResponse({ status: 200, type: [EmergencyEventResponseDto] })
  async listEmergencyEvents(
    @Query('wardId') wardId?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return this.nurseStationService.listEmergencyEvents({
      wardId,
      status,
      severity,
    });
  }

  @Get('emergency-events/:id')
  @Roles('DOCTOR', 'HEAD_NURSE', 'STAFF_NURSE')
  @ApiOperation({ summary: 'Get emergency event details' })
  @ApiResponse({ status: 200, type: EmergencyEventResponseDto })
  async getEmergencyEvent(@Param('id') id: string) {
    return this.nurseStationService.getEmergencyEvent(id);
  }

  @Patch('emergency-events/:id/acknowledge')
  @Roles('DOCTOR')
  @Auditable('update')
  @ApiOperation({ summary: 'Acknowledge emergency event (DOCTOR only)' })
  @ApiResponse({ status: 200, type: EmergencyEventResponseDto })
  async acknowledgeEmergencyEvent(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.nurseStationService.acknowledgeEmergencyEvent(id, user.id);
  }
}
