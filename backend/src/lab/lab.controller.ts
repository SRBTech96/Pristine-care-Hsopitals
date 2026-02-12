import { Controller, Post, Body, UseGuards, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LabService } from './lab.service';
import { CreateLabTestDto, LabTestResponseDto } from './dto/lab-test.dto';
import { CreateLabOrderDto, UpdateLabOrderStatusDto, LabOrderResponseDto } from './dto/lab-order.dto';
import { CollectSampleDto, LabSampleResponseDto } from './dto/lab-sample.dto';
import { PublishLabReportDto, ApproveLabReportDto, LabReportResponseDto } from './dto/lab-report.dto';

@ApiTags('Lab')
@ApiBearerAuth()
@Controller('lab')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabController {
  constructor(private svc: LabService) {}

  // Test Management (Admin/Lab Manager only)
  @Post('tests')
  @Roles('ADMIN', 'LAB_MANAGER')
  @Auditable('LAB_CREATE_TEST')
  @ApiOperation({ summary: 'Add lab test' })
  @ApiResponse({ status: 201, type: LabTestResponseDto })
  async addLabTest(@Body() dto: CreateLabTestDto, @CurrentUser() user: any): Promise<LabTestResponseDto> {
    const entity = await this.svc.addLabTest(dto, user.id);
    return { id: entity.id, testCode: entity.testCode, testName: entity.testName, sampleType: entity.sampleType, turnaroundTimeHours: entity.turnaroundTimeHours, cost: Number(entity.cost) };
  }

  @Get('tests')
  @Roles('ADMIN', 'LAB_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('LAB_LIST_TESTS')
  @ApiOperation({ summary: 'List lab tests' })
  @ApiResponse({ status: 200, type: [LabTestResponseDto] })
  async listLabTests(): Promise<LabTestResponseDto[]> {
    const items = await this.svc.listLabTests();
    return items.map(entity => ({
      id: entity.id,
      testCode: entity.testCode,
      testName: entity.testName,
      sampleType: entity.sampleType,
      turnaroundTimeHours: entity.turnaroundTimeHours,
      cost: Number(entity.cost),
    }));
  }

  @Get('tests/:id')
  @Roles('ADMIN', 'LAB_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('LAB_VIEW_TEST')
  @ApiOperation({ summary: 'Get lab test' })
  @ApiResponse({ status: 200, type: LabTestResponseDto })
  async getLabTest(@Param('id') id: string): Promise<LabTestResponseDto> {
    const entity = await this.svc.getLabTest(id);
    return { id: entity.id, testCode: entity.testCode, testName: entity.testName, sampleType: entity.sampleType, turnaroundTimeHours: entity.turnaroundTimeHours, cost: Number(entity.cost) };
  }

  // Order Management
  @Post('orders')
  @Roles('ADMIN', 'DOCTOR', 'STAFF')
  @Auditable('LAB_CREATE_ORDER')
  @ApiOperation({ summary: 'Create lab order' })
  @ApiResponse({ status: 201, type: LabOrderResponseDto })
  async createOrder(@Body() dto: CreateLabOrderDto, @CurrentUser() user: any): Promise<LabOrderResponseDto> {
    const entity = await this.svc.createOrder(dto, user.id);
    return { id: entity.id, orderNumber: entity.orderNumber, patientId: entity.patientId, testId: entity.testId, status: entity.status, orderDate: entity.orderDate };
  }

  @Get('orders/:id')
  @Roles('ADMIN', 'LAB_MANAGER', 'DOCTOR', 'STAFF', 'PATIENT')
  @Auditable('LAB_VIEW_ORDER')
  @ApiOperation({ summary: 'Get lab order' })
  @ApiResponse({ status: 200, type: LabOrderResponseDto })
  async getOrder(@Param('id') id: string): Promise<LabOrderResponseDto> {
    const entity = await this.svc.getOrder(id);
    return { id: entity.id, orderNumber: entity.orderNumber, patientId: entity.patientId, testId: entity.testId, status: entity.status, orderDate: entity.orderDate };
  }

  @Get('orders')
  @Roles('ADMIN', 'LAB_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('LAB_LIST_ORDERS')
  @ApiOperation({ summary: 'List lab orders' })
  @ApiResponse({ status: 200, type: [LabOrderResponseDto] })
  async listOrders(@Query('patientId') patientId?: string): Promise<LabOrderResponseDto[]> {
    if (patientId) {
      const items = await this.svc.listOrdersForPatient(patientId);
      return items.map(entity => ({
        id: entity.id,
        orderNumber: entity.orderNumber,
        patientId: entity.patientId,
        testId: entity.testId,
        status: entity.status,
        orderDate: entity.orderDate,
      }));
    }
    return [];
  }

  @Patch('orders/:id/status')
  @Roles('ADMIN', 'LAB_MANAGER')
  @Auditable('LAB_UPDATE_ORDER_STATUS')
  @ApiOperation({ summary: 'Update lab order status' })
  @ApiResponse({ status: 200, type: LabOrderResponseDto })
  async updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateLabOrderStatusDto, @CurrentUser() user: any): Promise<LabOrderResponseDto> {
    const entity = await this.svc.updateOrderStatus(id, dto, user.id);
    return { id: entity.id, orderNumber: entity.orderNumber, patientId: entity.patientId, testId: entity.testId, status: entity.status, orderDate: entity.orderDate };
  }

  // Sample Collection (Lab Staff/Technician only)
  @Post('samples')
  @Roles('ADMIN', 'LAB_MANAGER', 'LAB_TECH')
  @Auditable('LAB_COLLECT_SAMPLE')
  @ApiOperation({ summary: 'Collect lab sample' })
  @ApiResponse({ status: 201, type: LabSampleResponseDto })
  async collectSample(@Body() dto: CollectSampleDto, @CurrentUser() user: any): Promise<LabSampleResponseDto> {
    const entity = await this.svc.collectSample(dto, user.id);
    return { id: entity.id, orderId: entity.orderId, sampleCode: entity.sampleCode, collectionDate: entity.collectionDate, sampleQuality: entity.sampleQuality };
  }

  @Get('samples/:id')
  @Roles('ADMIN', 'LAB_MANAGER', 'LAB_TECH', 'DOCTOR', 'STAFF')
  @Auditable('LAB_VIEW_SAMPLE')
  @ApiOperation({ summary: 'Get lab sample' })
  @ApiResponse({ status: 200, type: LabSampleResponseDto })
  async getSample(@Param('id') id: string): Promise<LabSampleResponseDto> {
    const entity = await this.svc.getSample(id);
    return { id: entity.id, orderId: entity.orderId, sampleCode: entity.sampleCode, collectionDate: entity.collectionDate, sampleQuality: entity.sampleQuality };
  }

  // Report Publishing (Lab Staff/Pathologist)
  @Post('reports')
  @Roles('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST', 'LAB_TECH')
  @Auditable('LAB_PUBLISH_REPORT')
  @ApiOperation({ summary: 'Publish lab report' })
  @ApiResponse({ status: 201, type: LabReportResponseDto })
  async publishReport(@Body() dto: PublishLabReportDto, @CurrentUser() user: any): Promise<LabReportResponseDto> {
    const entity = await this.svc.publishReport(dto, user.id);
    return { id: entity.id, reportNumber: entity.reportNumber, orderId: entity.orderId, status: entity.status, reportDate: entity.reportDate, approvalDate: entity.approvalDate, publishedAt: entity.publishedAt };
  }

  @Get('reports/:id')
  @Roles('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST', 'DOCTOR', 'STAFF', 'PATIENT')
  @Auditable('LAB_VIEW_REPORT')
  @ApiOperation({ summary: 'Get lab report' })
  @ApiResponse({ status: 200, type: LabReportResponseDto })
  async getReport(@Param('id') id: string): Promise<LabReportResponseDto> {
    const entity = await this.svc.getReport(id);
    return { id: entity.id, reportNumber: entity.reportNumber, orderId: entity.orderId, status: entity.status, reportDate: entity.reportDate, approvalDate: entity.approvalDate, publishedAt: entity.publishedAt };
  }

  @Patch('reports/:id/approve')
  @Roles('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST')
  @Auditable('LAB_APPROVE_REPORT')
  @ApiOperation({ summary: 'Approve lab report' })
  @ApiResponse({ status: 200, type: LabReportResponseDto })
  async approveReport(@Param('id') id: string, @Body() dto: ApproveLabReportDto, @CurrentUser() user: any): Promise<LabReportResponseDto> {
    const entity = await this.svc.approveReport(id, dto, user.id, user.role);
    return { id: entity.id, reportNumber: entity.reportNumber, orderId: entity.orderId, status: entity.status, reportDate: entity.reportDate, approvalDate: entity.approvalDate, publishedAt: entity.publishedAt };
  }

  @Patch('reports/:id/publish')
  @Roles('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST')
  @Auditable('LAB_PUBLISH_APPROVED_REPORT')
  @ApiOperation({ summary: 'Publish approved lab report' })
  @ApiResponse({ status: 200, type: LabReportResponseDto })
  async publishApprovedReport(@Param('id') id: string, @CurrentUser() user: any): Promise<LabReportResponseDto> {
    const entity = await this.svc.publishApprovedReport(id, user.id);
    return { id: entity.id, reportNumber: entity.reportNumber, orderId: entity.orderId, status: entity.status, reportDate: entity.reportDate, approvalDate: entity.approvalDate, publishedAt: entity.publishedAt };
  }

  // Billing Linkage
  @Get('orders/:orderId/billing')
  @Roles('ADMIN', 'LAB_MANAGER', 'FINANCE')
  @Auditable('LAB_VIEW_BILLING')
  async getBillingAmount(@Param('orderId') orderId: string) {
    return this.svc.getBillingAmount(orderId);
  }
}
