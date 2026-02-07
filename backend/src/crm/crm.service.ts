import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientLead } from '../entities/patient-lead.entity';
import { FollowUp } from '../entities/follow-up.entity';
import { VisitAttribution } from '../entities/visit-attribution.entity';
import { DiscountApproval } from '../entities/discount-approval.entity';
import { CreatePatientLeadDto, UpdatePatientLeadDto, PatientLeadResponseDto } from './dto/patient-lead.dto';
import { CreateFollowUpDto, CompleteFollowUpDto, FollowUpResponseDto } from './dto/follow-up.dto';
import { CreateDiscountApprovalDto, DiscountApprovalResponseDto } from './dto/discount-approval.dto';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(PatientLead) private leadsRepo: Repository<PatientLead>,
    @InjectRepository(FollowUp) private followUpsRepo: Repository<FollowUp>,
    @InjectRepository(VisitAttribution) private visitAttrRepo: Repository<VisitAttribution>,
    @InjectRepository(DiscountApproval) private discountRepo: Repository<DiscountApproval>
  ) {}

  // ===== PATIENT LEADS =====

  async createLead(dto: CreatePatientLeadDto, userId: string): Promise<PatientLeadResponseDto> {
    const lead = this.leadsRepo.create({
      ...dto,
      createdBy: userId
    });
    const saved = await this.leadsRepo.save(lead);
    return this.toLeadDto(saved);
  }

  async getLead(id: string): Promise<PatientLeadResponseDto> {
    const lead = await this.leadsRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.toLeadDto(lead);
  }

  async listLeads(status?: string, source?: string): Promise<PatientLeadResponseDto[]> {
    const query = this.leadsRepo.createQueryBuilder('l');
    if (status) query.where('l.status = :status', { status });
    if (source) query.andWhere('l.source = :source', { source });
    const leads = await query.orderBy('l.createdAt', 'DESC').getMany();
    return leads.map(l => this.toLeadDto(l));
  }

  async updateLead(id: string, dto: UpdatePatientLeadDto, userId: string): Promise<PatientLeadResponseDto> {
    const lead = await this.leadsRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    if (dto.status) lead.status = dto.status;
    if (dto.notes) lead.notes = dto.notes;
    lead.updatedBy = userId;
    lead.updatedAt = new Date();

    const saved = await this.leadsRepo.save(lead);
    return this.toLeadDto(saved);
  }

  // ===== FOLLOW-UPS =====

  async createFollowUp(dto: CreateFollowUpDto, userId: string): Promise<FollowUpResponseDto> {
    const lead = await this.leadsRepo.findOne({ where: { id: dto.leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const followUp = this.followUpsRepo.create({
      ...dto,
      scheduledDate: new Date(dto.scheduledDate),
      createdBy: userId
    });
    const saved = await this.followUpsRepo.save(followUp);
    return this.toFollowUpDto(saved);
  }

  async getFollowUp(id: string): Promise<FollowUpResponseDto> {
    const followUp = await this.followUpsRepo.findOne({ where: { id } });
    if (!followUp) throw new NotFoundException('Follow-up not found');
    return this.toFollowUpDto(followUp);
  }

  async listFollowUpsForLead(leadId: string): Promise<FollowUpResponseDto[]> {
    const followUps = await this.followUpsRepo.find({
      where: { leadId },
      order: { scheduledDate: 'ASC' }
    });
    return followUps.map(f => this.toFollowUpDto(f));
  }

  async completeFollowUp(id: string, dto: CompleteFollowUpDto, userId: string): Promise<FollowUpResponseDto> {
    const followUp = await this.followUpsRepo.findOne({ where: { id } });
    if (!followUp) throw new NotFoundException('Follow-up not found');

    followUp.status = 'completed';
    followUp.outcome = dto.outcome;
    if (dto.notes) followUp.notes = dto.notes;
    followUp.completedAt = new Date();
    followUp.completedBy = userId;

    const saved = await this.followUpsRepo.save(followUp);
    return this.toFollowUpDto(saved);
  }

  // ===== VISIT ATTRIBUTION =====

  async attributeVisit(
    patientId: string,
    appointmentId: string,
    doctorId: string,
    attributionType: string,
    userId: string,
    leadId?: string
  ) {
    const visit = this.visitAttrRepo.create({
      patientId,
      appointmentId,
      doctorId,
      leadId,
      attributionType,
      createdBy: userId
    });
    return this.visitAttrRepo.save(visit);
  }

  async getVisitAttributions(patientId: string) {
    return this.visitAttrRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' }
    });
  }

  // ===== DISCOUNT APPROVALS =====

  async approveDiscount(
    dto: CreateDiscountApprovalDto,
    userId: string,
    userRole: string
  ): Promise<DiscountApprovalResponseDto> {
    // Only ADMIN can approve discounts
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can approve discounts');
    }

    const discount = this.discountRepo.create({
      ...dto,
      approvedBy: userId,
      createdBy: userId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      status: 'approved'
    });
    const saved = await this.discountRepo.save(discount);
    return this.toDiscountDto(saved);
  }

  async getDiscount(id: string): Promise<DiscountApprovalResponseDto> {
    const discount = await this.discountRepo.findOne({ where: { id } });
    if (!discount) throw new NotFoundException('Discount not found');
    return this.toDiscountDto(discount);
  }

  async listDiscountsForTarget(targetType: string, targetId: string) {
    return this.discountRepo.find({
      where: { targetType, targetId },
      order: { createdAt: 'DESC' }
    });
  }

  // ===== PRIVATE HELPERS =====

  private toLeadDto(lead: PatientLead): PatientLeadResponseDto {
    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      interestedIn: lead.interestedIn,
      notes: lead.notes,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    };
  }

  private toFollowUpDto(followUp: FollowUp): FollowUpResponseDto {
    return {
      id: followUp.id,
      leadId: followUp.leadId,
      doctorId: followUp.doctorId,
      scheduledDate: followUp.scheduledDate,
      followUpType: followUp.followUpType,
      status: followUp.status,
      notes: followUp.notes,
      outcome: followUp.outcome,
      createdAt: followUp.createdAt,
      completedAt: followUp.completedAt
    };
  }

  private toDiscountDto(discount: DiscountApproval): DiscountApprovalResponseDto {
    return {
      id: discount.id,
      targetType: discount.targetType,
      targetId: discount.targetId,
      discountPercentage: discount.discountPercentage,
      discountAmount: discount.discountAmount,
      reason: discount.reason,
      approvedBy: discount.approvedBy,
      approvalDate: discount.approvalDate,
      expiresAt: discount.expiresAt,
      status: discount.status,
      createdAt: discount.createdAt
    };
  }
}
