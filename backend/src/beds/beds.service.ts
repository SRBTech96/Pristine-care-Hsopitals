import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder } from 'typeorm';
import { Bed, Ward, RoomCategory, BedStatusHistory, Patient } from '../entities';
import {
  CreateBedDto,
  UpdateBedStatusDto,
  BedResponseDto,
  BedSummaryDto,
  BedStatus,
} from './dto/bed.dto';
import {
  CreateWardDto,
  UpdateWardDto,
  WardResponseDto,
} from './dto/ward.dto';
import {
  CreateRoomCategoryDto,
  UpdateRoomCategoryDto,
  RoomCategoryResponseDto,
} from './dto/room-category.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BedsService {
  constructor(
    @InjectRepository(Bed) private bedRepo: Repository<Bed>,
    @InjectRepository(Ward) private wardRepo: Repository<Ward>,
    @InjectRepository(RoomCategory) private roomCategoryRepo: Repository<RoomCategory>,
    @InjectRepository(BedStatusHistory) private historyRepo: Repository<BedStatusHistory>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    private auditService: AuditService,
  ) {}

  // ===== WARD MANAGEMENT =====

  async createWard(dto: CreateWardDto, userId: string): Promise<Ward> {
    const existing = await this.wardRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Ward with code ${dto.code} already exists`);
    }

    const ward = this.wardRepo.create({
      ...dto,
      createdBy: { id: userId } as any,
      updatedBy: { id: userId } as any,
    });

    return this.wardRepo.save(ward);
  }

  async listWards(filters?: {
    isActive?: boolean;
    category?: string;
  }): Promise<WardResponseDto[]> {
    let qb = this.wardRepo.createQueryBuilder('w');

    if (filters?.isActive !== undefined) {
      qb = qb.where('w.isActive = :isActive', { isActive: filters.isActive });
    }

    const wards = await qb.orderBy('w.name', 'ASC').getMany();
    return wards.map(w => this.wardToDto(w));
  }

  async getWard(id: string): Promise<WardResponseDto> {
    const ward = await this.wardRepo.findOne({
      where: { id },
      relations: ['beds'],
    });
    if (!ward) {
      throw new NotFoundException(`Ward ${id} not found`);
    }
    return this.wardToDto(ward);
  }

  async updateWard(id: string, dto: UpdateWardDto, userId: string): Promise<Ward> {
    const ward = await this.wardRepo.findOne({ where: { id } });
    if (!ward) {
      throw new NotFoundException(`Ward ${id} not found`);
    }

    Object.assign(ward, {
      ...dto,
      updatedBy: { id: userId } as any,
    });

    return this.wardRepo.save(ward);
  }

  // ===== ROOM CATEGORY MANAGEMENT =====

  async createRoomCategory(dto: CreateRoomCategoryDto): Promise<RoomCategory> {
    const existing = await this.roomCategoryRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Room category with code ${dto.code} already exists`,
      );
    }

    const category = this.roomCategoryRepo.create(dto);
    return this.roomCategoryRepo.save(category);
  }

  async listRoomCategories(): Promise<RoomCategoryResponseDto[]> {
    const categories = await this.roomCategoryRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return categories.map(c => this.roomCategoryToDto(c));
  }

  async updateRoomCategory(id: string, dto: UpdateRoomCategoryDto): Promise<RoomCategory> {
    const category = await this.roomCategoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Room category ${id} not found`);
    }

    Object.assign(category, dto);
    return this.roomCategoryRepo.save(category);
  }

  // ===== BED MANAGEMENT =====

  async createBed(dto: CreateBedDto, userId: string): Promise<Bed> {
    // Verify ward exists
    const ward = await this.wardRepo.findOne({ where: { id: dto.wardId } });
    if (!ward) {
      throw new NotFoundException(`Ward ${dto.wardId} not found`);
    }

    // Verify room category exists
    const category = await this.roomCategoryRepo.findOne({
      where: { id: dto.roomCategoryId },
    });
    if (!category) {
      throw new NotFoundException(`Room category ${dto.roomCategoryId} not found`);
    }

    // Check bed code is unique
    const existing = await this.bedRepo.findOne({
      where: { bedCode: dto.bedCode },
    });
    if (existing) {
      throw new ConflictException(`Bed with code ${dto.bedCode} already exists`);
    }

    const bed = this.bedRepo.create({
      ...dto,
      status: 'vacant',
      createdBy: { id: userId } as any,
      updatedBy: { id: userId } as any,
    });

    const saved = await this.bedRepo.save(bed);

    // Increment ward's total beds count
    ward.totalBeds = (ward.totalBeds || 0) + 1;
    await this.wardRepo.save(ward);

    return saved;
  }

  async listBeds(filters?: {
    wardId?: string;
    roomCategoryId?: string;
    status?: BedStatus;
  }): Promise<BedResponseDto[]> {
    let qb = this.bedRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.ward', 'w')
      .leftJoinAndSelect('b.roomCategory', 'rc')
      .leftJoinAndSelect('b.currentPatient', 'p')
      .where('b.isActive = :isActive', { isActive: true });

    if (filters?.wardId) {
      qb = qb.andWhere('b.ward_id = :wardId', { wardId: filters.wardId });
    }

    if (filters?.roomCategoryId) {
      qb = qb.andWhere('b.room_category_id = :roomCategoryId', {
        roomCategoryId: filters.roomCategoryId,
      });
    }

    if (filters?.status) {
      qb = qb.andWhere('b.status = :status', { status: filters.status });
    }

    const beds = await qb.orderBy('b.bedCode', 'ASC').getMany();
    return beds.map(b => this.bedToDto(b));
  }

  async getBed(id: string): Promise<BedResponseDto> {
    const bed = await this.bedRepo.findOne({
      where: { id },
      relations: ['ward', 'roomCategory', 'currentPatient', 'statusHistory'],
    });
    if (!bed) {
      throw new NotFoundException(`Bed ${id} not found`);
    }
    return this.bedToDto(bed);
  }

  async updateBedStatus(
    id: string,
    dto: UpdateBedStatusDto,
    userId: string,
  ): Promise<Bed> {
    const bed = await this.bedRepo.findOne({
      where: { id },
      relations: ['ward', 'currentPatient'],
    });
    if (!bed) {
      throw new NotFoundException(`Bed ${id} not found`);
    }

    const previousStatus = bed.status;
    const previousPatientId = bed.currentPatientId;

    // Validate patient exists if status is occupied
    let newPatient = null;
    if (dto.status === BedStatus.OCCUPIED && dto.patientId) {
      newPatient = await this.patientRepo.findOne({ where: { id: dto.patientId } });
      if (!newPatient) {
        throw new NotFoundException(`Patient ${dto.patientId} not found`);
      }
      bed.currentPatientId = dto.patientId;
      bed.admissionDate = new Date();
    } else if (dto.status !== BedStatus.OCCUPIED) {
      bed.currentPatientId = null;
      bed.admissionDate = null;
    }

    if (dto.estimatedDischargeDate) {
      bed.estimatedDischargeDate = new Date(dto.estimatedDischargeDate);
    }

    bed.status = dto.status;
    bed.updatedBy = { id: userId } as any;

    const updated = await this.bedRepo.save(bed);

    // Record status change in history
    const history = this.historyRepo.create({
      bed: { id } as any,
      previousStatus,
      newStatus: dto.status,
      previousPatientId,
      newPatientId: dto.patientId || null,
      changedBy: { id: userId } as any,
      changeReason: dto.changeReason,
    });
    await this.historyRepo.save(history);

    // Log audit
    await this.auditService.logAccess({
      userId,
      entityType: 'beds',
      entityId: id,
      action: 'update_status',
      oldValues: { status: previousStatus, patientId: previousPatientId },
      newValues: { status: dto.status, patientId: dto.patientId },
    });

    return updated;
  }

  // ===== SUMMARY & ANALYTICS =====

  async getBedSummary(): Promise<BedSummaryDto> {
    const qb = this.bedRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.ward', 'w')
      .where('b.isActive = :isActive', { isActive: true });

    const beds = await qb.getMany();

    const summary: BedSummaryDto = {
      totalBeds: beds.length,
      occupiedBeds: beds.filter(b => b.status === BedStatus.OCCUPIED).length,
      vacantBeds: beds.filter(b => b.status === BedStatus.VACANT).length,
      maintenanceBeds: beds.filter(b => b.status === BedStatus.MAINTENANCE).length,
      reservedBeds: beds.filter(b => b.status === BedStatus.RESERVED).length,
      occupancyRate: 0,
      byWard: [],
    };

    summary.occupancyRate =
      summary.totalBeds > 0
        ? Math.round((summary.occupiedBeds / summary.totalBeds) * 100)
        : 0;

    // Group by ward
    const wardGroups = new Map();
    beds.forEach(bed => {
      const wardId = bed.wardId;
      if (!wardGroups.has(wardId)) {
        wardGroups.set(wardId, []);
      }
      wardGroups.get(wardId).push(bed);
    });

    for (const [wardId, wardBeds] of wardGroups.entries()) {
      const ward = wardBeds[0]?.ward;
      summary.byWard.push({
        wardId,
        wardName: ward?.name || 'Unknown',
        category: ward?.code || '',
        totalBeds: wardBeds.length,
        occupiedBeds: wardBeds.filter(b => b.status === BedStatus.OCCUPIED).length,
        vacantBeds: wardBeds.filter(b => b.status === BedStatus.VACANT).length,
      });
    }

    return summary;
  }

  async getWardBedsByCategory(): Promise<any[]> {
    const qb = this.bedRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.ward', 'w')
      .leftJoinAndSelect('b.roomCategory', 'rc')
      .where('b.isActive = :isActive', { isActive: true });

    const beds = await qb.getMany();

    const grouped = new Map();
    beds.forEach(bed => {
      const key = `${bed.wardId}|${bed.roomCategoryId}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          wardId: bed.wardId,
          wardName: bed.ward?.name,
          wardCode: bed.ward?.code,
          categoryId: bed.roomCategoryId,
          categoryName: bed.roomCategory?.name,
          categoryCode: bed.roomCategory?.code,
          beds: [],
        });
      }
      grouped.get(key).beds.push(bed);
    });

    return Array.from(grouped.values());
  }

  // ===== HELPER METHODS =====

  private wardToDto(ward: Ward): WardResponseDto {
    return {
      id: ward.id,
      name: ward.name,
      code: ward.code,
      floorNumber: ward.floorNumber,
      building: ward.building,
      totalBeds: ward.totalBeds || 0,
      description: ward.description,
      isActive: ward.isActive,
      createdAt: ward.createdAt,
      updatedAt: ward.updatedAt,
    };
  }

  private roomCategoryToDto(category: RoomCategory): RoomCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description,
      capacity: category.capacity,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private bedToDto(bed: Bed): BedResponseDto {
    return {
      id: bed.id,
      bedCode: bed.bedCode,
      wardId: bed.wardId,
      wardName: bed.ward?.name,
      roomCategoryId: bed.roomCategoryId,
      roomCategoryName: bed.roomCategory?.name,
      roomNumber: bed.roomNumber,
      bedPosition: bed.bedPosition,
      status: bed.status,
      currentPatientId: bed.currentPatientId,
      currentPatientName: bed.currentPatient ? `${bed.currentPatient.firstName} ${bed.currentPatient.lastName}` : null,
      assignedToUserId: bed.assignedToUserId,
      admissionDate: bed.admissionDate,
      estimatedDischargeDate: bed.estimatedDischargeDate,
      specialRequirements: bed.specialRequirements,
      isActive: bed.isActive,
      createdAt: bed.createdAt,
      updatedAt: bed.updatedAt,
    };
  }
}
