import { Controller, Get, Post, Patch, Param, Body, UseGuards, UsePipes, ValidationPipe, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Auditable } from '../common/decorators/audit.decorator';
import { CrmService } from './crm.service';
import { CreatePatientLeadDto, UpdatePatientLeadDto } from './dto/patient-lead.dto';
import { CreateFollowUpDto, CompleteFollowUpDto } from './dto/follow-up.dto';
import { CreateDiscountApprovalDto } from './dto/discount-approval.dto';

@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private crmService: CrmService) {}

  // ===== LEADS ENDPOINTS =====

  /**
   * POST /api/crm/leads
   * Create a new patient lead
   * Requires: ADMIN, STAFF
   */
  @Post('leads')
  @Roles('ADMIN', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable({ entityType: 'patient_leads', accessType: 'create', resourceType: 'patient_leads' })
  async createLead(@Body() dto: CreatePatientLeadDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.crmService.createLead(dto, user.id);
  }

  /**
   * GET /api/crm/leads/:id
   * Get lead details
   * Requires: ADMIN, STAFF, DOCTOR
   */
  @Get('leads/:id')
  @Roles('ADMIN', 'STAFF', 'DOCTOR')
  @Auditable({ entityType: 'patient_leads', idParam: 'id', accessType: 'view' })
  async getLead(@Param('id') id: string) {
    return this.crmService.getLead(id);
  }

  /**
   * GET /api/crm/leads?status=new&source=website
   * List leads with optional filters
   * Requires: ADMIN, STAFF
   */
  @Get('leads')
  @Roles('ADMIN', 'STAFF')
  @Auditable({ entityType: 'patient_leads', accessType: 'list', resourceType: 'patient_leads' })
  async listLeads(@Query('status') status?: string, @Query('source') source?: string) {
    return this.crmService.listLeads(status, source);
  }

  /**
   * PATCH /api/crm/leads/:id
   * Update lead status or notes
   * Requires: ADMIN, STAFF
   */
  @Patch('leads/:id')
  @Roles('ADMIN', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable({ entityType: 'patient_leads', idParam: 'id', accessType: 'update' })
  async updateLead(@Param('id') id: string, @Body() dto: UpdatePatientLeadDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.crmService.updateLead(id, dto, user.id);
  }

  // ===== FOLLOW-UPS ENDPOINTS =====

  /**
   * POST /api/crm/follow-ups
   * Schedule a follow-up for a lead
   * Requires: ADMIN, STAFF, DOCTOR
   */
  @Post('follow-ups')
  @Roles('ADMIN', 'STAFF', 'DOCTOR')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable({ entityType: 'follow_ups', accessType: 'create', resourceType: 'follow_ups' })
  async createFollowUp(@Body() dto: CreateFollowUpDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.crmService.createFollowUp(dto, user.id);
  }

  /**
   * GET /api/crm/follow-ups/:id
   * Get follow-up details
   * Requires: ADMIN, STAFF, DOCTOR
   */
  @Get('follow-ups/:id')
  @Roles('ADMIN', 'STAFF', 'DOCTOR')
  @Auditable({ entityType: 'follow_ups', idParam: 'id', accessType: 'view' })
  async getFollowUp(@Param('id') id: string) {
    return this.crmService.getFollowUp(id);
  }

  /**
   * GET /api/crm/leads/:leadId/follow-ups
   * List all follow-ups for a lead
   * Requires: ADMIN, STAFF, DOCTOR
   */
  @Get('leads/:leadId/follow-ups')
  @Roles('ADMIN', 'STAFF', 'DOCTOR')
  @Auditable({ entityType: 'follow_ups', idParam: 'leadId', accessType: 'list' })
  async listFollowUps(@Param('leadId') leadId: string) {
    return this.crmService.listFollowUpsForLead(leadId);
  }

  /**
   * PATCH /api/crm/follow-ups/:id/complete
   * Mark follow-up as completed
   * Requires: ADMIN, STAFF, DOCTOR
   */
  @Patch('follow-ups/:id/complete')
  @Roles('ADMIN', 'STAFF', 'DOCTOR')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable({ entityType: 'follow_ups', idParam: 'id', accessType: 'update' })
  async completeFollowUp(@Param('id') id: string, @Body() dto: CompleteFollowUpDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.crmService.completeFollowUp(id, dto, user.id);
  }

  // ===== DISCOUNT ENDPOINTS =====

  /**
   * POST /api/crm/discounts
   * Request discount approval (ADMIN only)
   * Requires: ADMIN
   */
  @Post('discounts')
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable({ entityType: 'discount_approvals', accessType: 'create', resourceType: 'discount_approvals' })
  async approveDiscount(@Body() dto: CreateDiscountApprovalDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.crmService.approveDiscount(dto, user.id, user.role);
  }

  /**
   * GET /api/crm/discounts/:id
   * Get discount approval details
   * Requires: ADMIN, STAFF
   */
  @Get('discounts/:id')
  @Roles('ADMIN', 'STAFF')
  @Auditable({ entityType: 'discount_approvals', idParam: 'id', accessType: 'view' })
  async getDiscount(@Param('id') id: string) {
    return this.crmService.getDiscount(id);
  }

  /**
   * GET /api/crm/discounts?targetType=appointment&targetId=apt-uuid
   * List discounts for a target
   * Requires: ADMIN, STAFF
   */
  @Get('discounts')
  @Roles('ADMIN', 'STAFF')
  @Auditable({ entityType: 'discount_approvals', accessType: 'list', resourceType: 'discount_approvals' })
  async listDiscounts(@Query('targetType') targetType: string, @Query('targetId') targetId: string) {
    if (!targetType || !targetId) {
      return { error: 'targetType and targetId required' };
    }
    return this.crmService.listDiscountsForTarget(targetType, targetId);
  }
}
