import { Controller, Post, Body, UseGuards, Get, Param, Patch, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LabService } from './lab.service';
import { CreateLabTestDto } from './dto/lab-test.dto';
import { CreateLabOrderDto, UpdateLabOrderStatusDto } from './dto/lab-order.dto';
import { CollectSampleDto } from './dto/lab-sample.dto';
import { PublishLabReportDto, ApproveLabReportDto } from './dto/lab-report.dto';

@Controller('lab')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabController {
  constructor(private svc: LabService) {}

  // Test Management (Admin/Lab Manager only)
  @Post('tests')
  @Roles('ADMIN', 'LAB_MANAGER')
  @Auditable('LAB_CREATE_TEST')
  async addLabTest(@Body() dto: CreateLabTestDto, @CurrentUser() user: any) {
    return this.svc.addLabTest(dto, user.id);
  }

  @Get('tests')
  @Roles('ADMIN', 'LAB_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('LAB_LIST_TESTS')
  async listLabTests() {
    return this.svc.listLabTests();
  }

  @Get('tests/:id')
  @Roles('ADMIN', 'LAB_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('LAB_VIEW_TEST')
  async getLabTest(@Param('id') id: string) {
    return this.svc.getLabTest(id);
  }

  // Order Management
  @Post('orders')
  @Roles('ADMIN', 'DOCTOR', 'STAFF')
  @Auditable('LAB_CREATE_ORDER')
  async createOrder(@Body() dto: CreateLabOrderDto, @CurrentUser() user: any) {
    return this.svc.createOrder(dto, user.id);
  }

  @Get('orders/:id')
  @Roles('ADMIN', 'LAB_MANAGER', 'DOCTOR', 'STAFF', 'PATIENT')
  @Auditable('LAB_VIEW_ORDER')
  async getOrder(@Param('id') id: string) {
    return this.svc.getOrder(id);
  }

  @Get('orders')
  @Roles('ADMIN', 'LAB_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('LAB_LIST_ORDERS')
  async listOrders(@Query('patientId') patientId?: string) {
    if (patientId) {
      return this.svc.listOrdersForPatient(patientId);
    }
    return [];
  }

  @Patch('orders/:id/status')
  @Roles('ADMIN', 'LAB_MANAGER')
  @Auditable('LAB_UPDATE_ORDER_STATUS')
  async updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateLabOrderStatusDto, @CurrentUser() user: any) {
    return this.svc.updateOrderStatus(id, dto, user.id);
  }

  // Sample Collection (Lab Staff/Technician only)
  @Post('samples')
  @Roles('ADMIN', 'LAB_MANAGER', 'LAB_TECH')
  @Auditable('LAB_COLLECT_SAMPLE')
  async collectSample(@Body() dto: CollectSampleDto, @CurrentUser() user: any) {
    return this.svc.collectSample(dto, user.id);
  }

  @Get('samples/:id')
  @Roles('ADMIN', 'LAB_MANAGER', 'LAB_TECH', 'DOCTOR', 'STAFF')
  @Auditable('LAB_VIEW_SAMPLE')
  async getSample(@Param('id') id: string) {
    return this.svc.getSample(id);
  }

  // Report Publishing (Lab Staff/Pathologist)
  @Post('reports')
  @Roles('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST', 'LAB_TECH')
  @Auditable('LAB_PUBLISH_REPORT')
  async publishReport(@Body() dto: PublishLabReportDto, @CurrentUser() user: any) {
    return this.svc.publishReport(dto, user.id);
  }

  @Get('reports/:id')
  @Roles('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST', 'DOCTOR', 'STAFF', 'PATIENT')
  @Auditable('LAB_VIEW_REPORT')
  async getReport(@Param('id') id: string) {
    return this.svc.getReport(id);
  }

  @Patch('reports/:id/approve')
  @Roles('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST')
  @Auditable('LAB_APPROVE_REPORT')
  async approveReport(@Param('id') id: string, @Body() dto: ApproveLabReportDto, @CurrentUser() user: any) {
    return this.svc.approveReport(id, dto, user.id, user.role);
  }

  @Patch('reports/:id/publish')
  @Roles('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST')
  @Auditable('LAB_PUBLISH_APPROVED_REPORT')
  async publishApprovedReport(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.publishApprovedReport(id, user.id);
  }

  // Billing Linkage
  @Get('orders/:orderId/billing')
  @Roles('ADMIN', 'LAB_MANAGER', 'FINANCE')
  @Auditable('LAB_VIEW_BILLING')
  async getBillingAmount(@Param('orderId') orderId: string) {
    return this.svc.getBillingAmount(orderId);
  }
}
