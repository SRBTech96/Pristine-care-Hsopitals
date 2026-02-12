import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NurseAssignment,
  InpatientAdmission,
  DoctorOrder,
  MedicationSchedule,
  MedicationAdministration,
  VitalsRecord,
  EmergencyEvent,
  Patient,
  User,
  Ward,
  Bed,
} from '../entities';
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
  ApproveDoctorOrderDto,
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
import { AuditService } from '../audit/audit.service';

@Injectable()
export class NurseStationService {
  constructor(
    @InjectRepository(NurseAssignment) private assignmentRepo: Repository<NurseAssignment>,
    @InjectRepository(InpatientAdmission) private admissionRepo: Repository<InpatientAdmission>,
    @InjectRepository(DoctorOrder) private orderRepo: Repository<DoctorOrder>,
    @InjectRepository(MedicationSchedule) private medicationScheduleRepo: Repository<MedicationSchedule>,
    @InjectRepository(MedicationAdministration) private medicationAdminRepo: Repository<MedicationAdministration>,
    @InjectRepository(VitalsRecord) private vitalsRepo: Repository<VitalsRecord>,
    @InjectRepository(EmergencyEvent) private emergencyRepo: Repository<EmergencyEvent>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Ward) private wardRepo: Repository<Ward>,
    @InjectRepository(Bed) private bedRepo: Repository<Bed>,
    private auditService: AuditService,
  ) {}

  // ===== NURSE ASSIGNMENTS =====

  async createNurseAssignment(
    dto: NurseAssignmentDto,
    headNurseId: string,
  ): Promise<NurseAssignment> {
    // Verify nurse exists
    const nurse = await this.userRepo.findOne({ where: { id: dto.nurseId } });
    if (!nurse) {
      throw new NotFoundException(`Nurse ${dto.nurseId} not found`);
    }

    const assignment = this.assignmentRepo.create({
      ...dto,
      assignedById: headNurseId,
    });

    return this.assignmentRepo.save(assignment);
  }

  async listNurseAssignments(wardId?: string, nurseId?: string): Promise<NurseAssignmentResponseDto[]> {
    let qb = this.assignmentRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.nurse', 'n')
      .leftJoinAndSelect('a.ward', 'w')
      .leftJoinAndSelect('a.assignedBy', 'ab')
      .where('a.status = :status', { status: 'active' });

    if (wardId) {
      qb = qb.andWhere('a.ward_id = :wardId', { wardId });
    }

    if (nurseId) {
      qb = qb.andWhere('a.nurse_id = :nurseId', { nurseId });
    }

    const assignments = await qb.orderBy('a.createdAt', 'DESC').getMany();
    return assignments.map(a => this.assignmentToDto(a));
  }

  async updateNurseAssignment(
    id: string,
    dto: UpdateNurseAssignmentDto,
    userId: string,
  ): Promise<NurseAssignment> {
    const assignment = await this.assignmentRepo.findOne({ where: { id } });
    if (!assignment) {
      throw new NotFoundException(`Assignment ${id} not found`);
    }

    Object.assign(assignment, dto);
    return this.assignmentRepo.save(assignment);
  }

  // ===== INPATIENT ADMISSIONS =====

  async createInpatientAdmission(
    dto: InpatientAdmissionDto,
    userId: string,
  ): Promise<InpatientAdmission> {
    // Verify patient exists
    const patient = await this.patientRepo.findOne({ where: { id: dto.patientId } });
    if (!patient) {
      throw new NotFoundException(`Patient ${dto.patientId} not found`);
    }

    // Verify bed exists and is vacant
    const bed = await this.bedRepo.findOne({ where: { id: dto.bedId } });
    if (!bed) {
      throw new NotFoundException(`Bed ${dto.bedId} not found`);
    }

    if (bed.status !== 'vacant' && bed.status !== 'reserved') {
      throw new ConflictException(`Bed ${bed.bedCode} is not available`);
    }

    // Verify ward exists
    const ward = await this.wardRepo.findOne({ where: { id: dto.wardId } });
    if (!ward) {
      throw new NotFoundException(`Ward ${dto.wardId} not found`);
    }

    const admission = this.admissionRepo.create({
      ...dto,
      createdBy: { id: userId } as any,
      updatedBy: { id: userId } as any,
    });

    const saved = await this.admissionRepo.save(admission);

    // Update bed status to occupied
    bed.status = 'occupied';
    bed.currentPatientId = dto.patientId;
    bed.admissionDate = new Date();
    bed.updatedBy = { id: userId } as any;
    await this.bedRepo.save(bed);

    // Log admission
    await this.auditService.logAccess({
      userId,
      entityType: 'inpatient_admissions',
      entityId: saved.id,
      action: 'create',
      newValues: { patientId: dto.patientId, bedId: dto.bedId },
    });

    return saved;
  }

  async listInpatientAdmissions(
    filters?: {
      wardId?: string;
      status?: string;
      isIcu?: boolean;
      isNicu?: boolean;
    },
  ): Promise<InpatientAdmissionResponseDto[]> {
    let qb = this.admissionRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'p')
      .leftJoinAndSelect('a.bed', 'b')
      .leftJoinAndSelect('a.ward', 'w')
      .leftJoinAndSelect('a.attendingDoctor', 'ad');

    if (filters?.wardId) {
      qb = qb.where('a.ward_id = :wardId', { wardId: filters.wardId });
    }

    if (filters?.status) {
      qb = qb.andWhere('a.status = :status', { status: filters.status });
    }

    if (filters?.isIcu) {
      qb = qb.andWhere('a.isIcu = :isIcu', { isIcu: true });
    }

    if (filters?.isNicu) {
      qb = qb.andWhere('a.isNicu = :isNicu', { isNicu: true });
    }

    const admissions = await qb.orderBy('a.admissionDate', 'DESC').getMany();
    return admissions.map(a => this.admissionToDto(a));
  }

  async getInpatientAdmission(id: string): Promise<InpatientAdmissionResponseDto> {
    const admission = await this.admissionRepo.findOne({
      where: { id },
      relations: ['patient', 'bed', 'ward', 'attendingDoctor'],
    });

    if (!admission) {
      throw new NotFoundException(`Admission ${id} not found`);
    }

    return this.admissionToDto(admission);
  }

  async dischargePatient(
    id: string,
    dto: UpdateInpatientAdmissionDto,
    userId: string,
  ): Promise<InpatientAdmission> {
    const admission = await this.admissionRepo.findOne({
      where: { id },
      relations: ['bed'],
    });

    if (!admission) {
      throw new NotFoundException(`Admission ${id} not found`);
    }

    admission.status = 'discharged';
    admission.dischargeDate = new Date();
    admission.dischargeSummary = dto.dischargeSummary ?? null;
    admission.updatedBy = { id: userId } as any;

    const updated = await this.admissionRepo.save(admission);

    // Update bed to vacant
    if (admission.bed) {
      admission.bed.status = 'vacant';
      // Ensure currentPatientId and admissionDate are nullable in entity
      admission.bed.currentPatientId = null;
      admission.bed.admissionDate = null;
      admission.bed.updatedBy = { id: userId } as any;
      await this.bedRepo.save(admission.bed);
    }

    // Log discharge
    await this.auditService.logAccess({
      userId,
      entityType: 'inpatient_admissions',
      entityId: id,
      action: 'discharge',
      newValues: { status: 'discharged' },
    });

    return updated;
  }

  // ===== DOCTOR ORDERS =====

  async createDoctorOrder(
    dto: CreateDoctorOrderDto,
    doctorId: string,
  ): Promise<DoctorOrder> {
    // Verify admission exists
    const admission = await this.admissionRepo.findOne({
      where: { id: dto.inpatientAdmissionId },
    });
    if (!admission) {
      throw new NotFoundException(`Admission ${dto.inpatientAdmissionId} not found`);
    }

    const order = this.orderRepo.create({
      ...dto,
      doctorId,
    });

    return this.orderRepo.save(order);
  }

  async listDoctorOrders(
    admissionId: string,
    filters?: { status?: string; orderType?: string },
  ): Promise<DoctorOrderResponseDto[]> {
    let qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.admission', 'a')
      .leftJoinAndSelect('a.patient', 'p')
      .leftJoinAndSelect('o.doctor', 'd')
      .where('o.inpatient_admission_id = :admissionId', { admissionId });

    if (filters?.status) {
      qb = qb.andWhere('o.status = :status', { status: filters.status });
    }

    if (filters?.orderType) {
      qb = qb.andWhere('o.orderType = :orderType', { orderType: filters.orderType });
    }

    const orders = await qb.orderBy('o.orderDate', 'DESC').getMany();
    return orders.map(o => this.orderToDto(o));
  }

  async getDoctorOrder(id: string): Promise<DoctorOrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['admission', 'admission.patient', 'doctor'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return this.orderToDto(order);
  }

  // ===== MEDICATION SCHEDULES =====

  async createMedicationSchedule(
    dto: MedicationScheduleDto,
    doctorId: string,
  ): Promise<MedicationSchedule> {
    // Verify doctor order exists
    const order = await this.orderRepo.findOne({
      where: { id: dto.doctorOrderId },
    });
    if (!order) {
      throw new NotFoundException(`Order ${dto.doctorOrderId} not found`);
    }

    const schedule = this.medicationScheduleRepo.create({
      ...dto,
      prescribingDoctorId: doctorId,
    });

    return this.medicationScheduleRepo.save(schedule);
  }

  async listMedicationSchedules(
    admissionId: string,
    filters?: { status?: string },
  ): Promise<MedicationScheduleResponseDto[]> {
    let qb = this.medicationScheduleRepo
      .createQueryBuilder('ms')
      .leftJoinAndSelect('ms.admission', 'a')
      .leftJoinAndSelect('a.patient', 'p')
      .leftJoinAndSelect('ms.doctorOrder', 'o')
      .leftJoinAndSelect('ms.prescribingDoctor', 'pd')
      .where('ms.inpatient_admission_id = :admissionId', { admissionId });

    if (filters?.status) {
      qb = qb.andWhere('ms.status = :status', { status: filters.status });
    }

    const schedules = await qb.orderBy('ms.startDate', 'DESC').getMany();
    return schedules.map(s => this.medicationScheduleToDto(s));
  }

  // ===== MEDICATION ADMINISTRATION =====

  async executeMedication(
    dto: ExecuteMedicationDto,
    staffNurseId: string,
  ): Promise<MedicationAdministration> {
    // Get medication schedule
    const schedule = await this.medicationScheduleRepo.findOne({
      where: { id: dto.medicationScheduleId },
      relations: ['admission'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule ${dto.medicationScheduleId} not found`);
    }

    // Get pending administration record
    let admin = await this.medicationAdminRepo.findOne({
      where: {
        medicationScheduleId: dto.medicationScheduleId,
        status: 'pending',
      },
    });

    if (!admin) {
      // Create new administration record if doesn't exist
      admin = this.medicationAdminRepo.create({
        medicationScheduleId: dto.medicationScheduleId,
        inpatientAdmissionId: schedule.inpatientAdmissionId,
        scheduledTime: new Date(),
      });
    }

    Object.assign(admin, {
      ...dto,
      status: 'administered',
      administeredTime: new Date(),
      administeredById: staffNurseId,
    });

    const saved = await this.medicationAdminRepo.save(admin);

    // Log medication administration
    await this.auditService.logAccess({
      userId: staffNurseId,
      entityType: 'medication_administrations',
      entityId: saved.id,
      action: 'execute',
      newValues: {
        medicationName: schedule.medicationName,
        status: 'administered',
      },
    });

    return saved;
  }

  async skipMedication(
    dto: SkipMedicationDto,
    staffNurseId: string,
  ): Promise<MedicationAdministration> {
    const schedule = await this.medicationScheduleRepo.findOne({
      where: { id: dto.medicationScheduleId },
      relations: ['admission'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule ${dto.medicationScheduleId} not found`);
    }

    const admin = this.medicationAdminRepo.create({
      medicationScheduleId: dto.medicationScheduleId,
      inpatientAdmissionId: schedule.inpatientAdmissionId,
      scheduledTime: new Date(),
      status: 'not_given',
      reasonIfNotGiven: dto.reason,
      administeredById: staffNurseId,
    });

    const saved = await this.medicationAdminRepo.save(admin);

    // Log medication skip
    await this.auditService.logAccess({
      userId: staffNurseId,
      entityType: 'medication_administrations',
      entityId: saved.id,
      action: 'skip',
      newValues: {
        status: 'not_given',
        reason: dto.reason,
      },
    });

    return saved;
  }

  async getMedicationAdministration(id: string): Promise<MedicationAdministrationResponseDto> {
    const admin = await this.medicationAdminRepo.findOne({
      where: { id },
      relations: [
        'medicationSchedule',
        'admission',
        'admission.patient',
        'administeredBy',
        'verifiedBy',
      ],
    });

    if (!admin) {
      throw new NotFoundException(`Administration record ${id} not found`);
    }

    return this.medicationAdminToDto(admin);
  }

  // ===== VITAL SIGNS =====

  async recordVitals(
    dto: RecordVitalsDto,
    staffNurseId: string,
  ): Promise<VitalsRecord> {
    // Verify admission exists
    const admission = await this.admissionRepo.findOne({
      where: { id: dto.inpatientAdmissionId },
    });

    if (!admission) {
      throw new NotFoundException(`Admission ${dto.inpatientAdmissionId} not found`);
    }

    const vitals = this.vitalsRepo.create({
      ...dto,
      recordedById: staffNurseId,
      recordedAt: new Date(),
    });

    if (dto.reportToDoctorId) {
      vitals.reportedToDoctorId = dto.reportToDoctorId;
      vitals.reportedAt = new Date();
    }

    const saved = await this.vitalsRepo.save(vitals);

    // Log vital signs recording
    await this.auditService.logAccess({
      userId: staffNurseId,
      entityType: 'vitals_records',
      entityId: saved.id,
      action: 'record',
      newValues: {
        temperature: dto.temperatureCelsius,
        heartRate: dto.heartRateBpm,
      },
    });

    return saved;
  }

  async listPatientVitals(admissionId: string): Promise<VitalsRecordResponseDto[]> {
    const vitals = await this.vitalsRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.admission', 'a')
      .leftJoinAndSelect('a.patient', 'p')
      .leftJoinAndSelect('v.recordedBy', 'rb')
      .leftJoinAndSelect('v.reportedToDoctor', 'rtd')
      .where('v.inpatient_admission_id = :admissionId', { admissionId })
      .orderBy('v.recordedAt', 'DESC')
      .getMany();

    return vitals.map(v => this.vitalsToDto(v));
  }

  // ===== EMERGENCY EVENTS =====

  async raiseEmergencyEvent(
    dto: RaiseEmergencyEventDto,
    staffNurseId: string,
  ): Promise<EmergencyEvent> {
    // Verify patient exists
    const patient = await this.patientRepo.findOne({ where: { id: dto.patientId } });
    if (!patient) {
      throw new NotFoundException(`Patient ${dto.patientId} not found`);
    }

    const event = this.emergencyRepo.create({
      ...dto,
      reportedById: staffNurseId,
      timeOfEvent: new Date(),
      status: 'reported',
    });

    const saved = await this.emergencyRepo.save(event);

    // Log emergency event
    await this.auditService.logAccess({
      userId: staffNurseId,
      entityType: 'emergency_events',
      entityId: saved.id,
      action: 'raise',
      newValues: {
        eventType: dto.eventType,
        severity: dto.severity,
      },
    });

    // TODO: Notify doctors via notification service
    if (dto.doctorsToNotify && dto.doctorsToNotify.length > 0) {
      saved.doctorsNotifiedIds = dto.doctorsToNotify;
      saved.notifiedAt = new Date();
      await this.emergencyRepo.save(saved);
    }

    return saved;
  }

  async listEmergencyEvents(
    filters?: {
      wardId?: string;
      status?: string;
      severity?: string;
    },
  ): Promise<EmergencyEventResponseDto[]> {
    let qb = this.emergencyRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.admission', 'a')
      .leftJoinAndSelect('e.patient', 'p')
      .leftJoinAndSelect('e.reportedBy', 'rb')
      .leftJoinAndSelect('e.resolvingDoctor', 'rd');

    if (filters?.status) {
      qb = qb.where('e.status = :status', { status: filters.status });
    }

    if (filters?.severity) {
      qb = qb.andWhere('e.severity = :severity', { severity: filters.severity });
    }

    const events = await qb.orderBy('e.timeOfEvent', 'DESC').getMany();
    return events.map(e => this.emergencyToDto(e));
  }

  async getEmergencyEvent(id: string): Promise<EmergencyEventResponseDto> {
    const event = await this.emergencyRepo.findOne({
      where: { id },
      relations: ['admission', 'patient', 'reportedBy', 'resolvingDoctor'],
    });

    if (!event) {
      throw new NotFoundException(`Emergency event ${id} not found`);
    }

    return this.emergencyToDto(event);
  }

  async acknowledgeEmergencyEvent(id: string, doctorId: string): Promise<EmergencyEvent> {
    const event = await this.emergencyRepo.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    event.status = 'in_progress';
    event.resolvingDoctorId = doctorId;

    const updated = await this.emergencyRepo.save(event);

    // Log acknowledgment
    await this.auditService.logAccess({
      userId: doctorId,
      entityType: 'emergency_events',
      entityId: id,
      action: 'acknowledge',
      newValues: { status: 'in_progress' },
    });

    return updated;
  }

  // ===== HELPER METHODS =====

  private assignmentToDto(a: NurseAssignment): NurseAssignmentResponseDto {
    return {
      id: a.id,
      nurseId: a.nurseId,
      nurseeName: a.nurse ? `${a.nurse.firstName} ${a.nurse.lastName}` : '',
      wardId: a.wardId,
      wardName: a.ward?.name,
      floorNumber: a.floorNumber,
      assignedBeds: a.assignedBeds || [],
      shiftStartTime: a.shiftStartTime,
      shiftEndTime: a.shiftEndTime,
      shiftDate: a.shiftDate,
      assignedById: a.assignedById,
      status: a.status,
      notes: a.notes,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  private admissionToDto(a: InpatientAdmission): InpatientAdmissionResponseDto {
    return {
      id: a.id,
      patientId: a.patientId,
      patientName: a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '',
      bedId: a.bedId,
      bedCode: a.bed?.bedCode,
      wardId: a.wardId,
      wardName: a.ward?.name,
      admissionDate: a.admissionDate,
      dischargeDate: a.dischargeDate,
      admissionType: a.admissionType,
      attendingDoctorId: a.attendingDoctorId,
      attendingDoctorName: a.attendingDoctor
        ? `${a.attendingDoctor.firstName} ${a.attendingDoctor.lastName}`
        : '',
      chiefComplaint: a.chiefComplaint,
      admissionNotes: a.admissionNotes,
      dischargeSummary: a.dischargeSummary,
      status: a.status,
      isIcu: a.isIcu,
      isNicu: a.isNicu,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  private orderToDto(o: DoctorOrder): DoctorOrderResponseDto {
    return {
      id: o.id,
      inpatientAdmissionId: o.inpatientAdmissionId,
      patientId: o.admission?.patientId,
      patientName: o.admission?.patient
        ? `${o.admission.patient.firstName} ${o.admission.patient.lastName}`
        : '',
      doctorId: o.doctorId,
      doctorName: o.doctor ? `${o.doctor.firstName} ${o.doctor.lastName}` : '',
      orderDate: o.orderDate,
      orderType: o.orderType,
      description: o.description,
      instructions: o.instructions,
      priority: o.priority,
      status: o.status,
      scheduledDate: o.scheduledDate,
      expectedCompletionDate: o.expectedCompletionDate,
      approvalsRequired: o.approvalsRequired,
      approvedById: o.approvedById,
      approvedAt: o.approvedAt,
      cancelledById: o.cancelledById,
      cancelledAt: o.cancelledAt,
      cancellationReason: o.cancellationReason,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }

  private medicationScheduleToDto(s: MedicationSchedule): MedicationScheduleResponseDto {
    return {
      id: s.id,
      doctorOrderId: s.doctorOrderId,
      inpatientAdmissionId: s.inpatientAdmissionId,
      patientId: s.admission?.patientId,
      patientName: s.admission?.patient
        ? `${s.admission.patient.firstName} ${s.admission.patient.lastName}`
        : '',
      medicationName: s.medicationName,
      dosage: s.dosage,
      unit: s.unit,
      frequency: s.frequency,
      route: s.route,
      startDate: s.startDate,
      endDate: s.endDate,
      durationDays: s.durationDays,
      specialInstructions: s.specialInstructions,
      contraindications: s.contraindications,
      allergiesToCheck: s.allergiesToCheck,
      requiresMonitoring: s.requiresMonitoring,
      monitoringParameters: s.monitoringParameters,
      prescribingDoctorId: s.prescribingDoctorId,
      prescribingDoctorName: s.prescribingDoctor
        ? `${s.prescribingDoctor.firstName} ${s.prescribingDoctor.lastName}`
        : '',
      prescribedAt: s.prescribedAt,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  private medicationAdminToDto(a: MedicationAdministration): MedicationAdministrationResponseDto {
    return {
      id: a.id,
      medicationScheduleId: a.medicationScheduleId,
      medicationName: a.medicationSchedule?.medicationName,
      dosage: a.medicationSchedule?.dosage,
      route: a.medicationSchedule?.route,
      inpatientAdmissionId: a.inpatientAdmissionId,
      patientId: a.admission?.patientId,
      patientName: a.admission?.patient
        ? `${a.admission.patient.firstName} ${a.admission.patient.lastName}`
        : '',
      scheduledTime: a.scheduledTime,
      administeredTime: a.administeredTime,
      administeredById: a.administeredById,
      administeredByName: a.administeredBy
        ? `${a.administeredBy.firstName} ${a.administeredBy.lastName}`
        : '',
      status: a.status,
      reasonIfNotGiven: a.reasonIfNotGiven,
      actualDosage: a.actualDosage,
      routeUsed: a.routeUsed,
      siteOfAdministration: a.siteOfAdministration,
      batchNumber: a.batchNumber,
      expiryDate: a.expiryDate,
      nurseNotes: a.nurseNotes,
      patientResponse: a.patientResponse,
      sideEffectsObserved: a.sideEffectsObserved,
      sideEffectsDetails: a.sideEffectsDetails,
      verifiedById: a.verifiedById,
      verifiedByName: a.verifiedBy
        ? `${a.verifiedBy.firstName} ${a.verifiedBy.lastName}`
        : '',
      verifiedAt: a.verifiedAt,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  private vitalsToDto(v: VitalsRecord): VitalsRecordResponseDto {
    return {
      id: v.id,
      inpatientAdmissionId: v.inpatientAdmissionId,
      patientId: v.admission?.patientId,
      patientName: v.admission?.patient
        ? `${v.admission.patient.firstName} ${v.admission.patient.lastName}`
        : '',
      recordedById: v.recordedById,
      recordedByName: v.recordedBy
        ? `${v.recordedBy.firstName} ${v.recordedBy.lastName}`
        : '',
      recordedAt: v.recordedAt,
      temperatureCelsius: Number(v.temperatureCelsius),
      heartRateBpm: v.heartRateBpm,
      systolicBp: v.systolicBp,
      diastolicBp: v.diastolicBp,
      respiratoryRateRpm: v.respiratoryRateRpm,
      oxygenSaturationPercent: Number(v.oxygenSaturationPercent),
      bloodGlucoseMmol: Number(v.bloodGlucoseMmol),
      weightKg: Number(v.weightKg),
      heightCm: Number(v.heightCm),
      painScore: v.painScore,
      gcsScore: v.gcsScore,
      consciousnessLevel: v.consciousnessLevel,
      urineOutputMl: v.urineOutputMl,
      bowelMovementStatus: v.bowelMovementStatus,
      notes: v.notes,
      abnormalFindings: v.abnormalFindings,
      reportedToDoctorId: v.reportedToDoctorId,
      reportedToDoctorName: v.reportedToDoctor
        ? `${v.reportedToDoctor.firstName} ${v.reportedToDoctor.lastName}`
        : '',
      reportedAt: v.reportedAt,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }

  private emergencyToDto(e: EmergencyEvent): EmergencyEventResponseDto {
    return {
      id: e.id,
      inpatientAdmissionId: e.inpatientAdmissionId,
      patientId: e.patientId,
      patientName: e.patient ? `${e.patient.firstName} ${e.patient.lastName}` : '',
      reportedById: e.reportedById,
      reportedByName: e.reportedBy
        ? `${e.reportedBy.firstName} ${e.reportedBy.lastName}`
        : '',
      eventType: e.eventType,
      severity: e.severity,
      location: e.location,
      description: e.description,
      timeOfEvent: e.timeOfEvent,
      responseStartTime: e.responseStartTime,
      responseEndTime: e.responseEndTime,
      doctorsNotifiedIds: e.doctorsNotifiedIds || [],
      notifiedAt: e.notifiedAt,
      actionsTaken: e.actionsTaken,
      outcome: e.outcome,
      status: e.status,
      resolvingDoctorId: e.resolvingDoctorId,
      resolvingDoctorName: e.resolvingDoctor
        ? `${e.resolvingDoctor.firstName} ${e.resolvingDoctor.lastName}`
        : '',
      resolvedAt: e.resolvedAt,
      followUpRequired: e.followUpRequired,
      followUpNotes: e.followUpNotes,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}
