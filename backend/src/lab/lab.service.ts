import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabTest } from '../entities/lab-test.entity';
import { LabOrder } from '../entities/lab-order.entity';
import { LabSample } from '../entities/lab-sample.entity';
import { LabReport } from '../entities/lab-report.entity';
import { CreateLabTestDto } from './dto/lab-test.dto';
import { CreateLabOrderDto, UpdateLabOrderStatusDto } from './dto/lab-order.dto';
import { CollectSampleDto } from './dto/lab-sample.dto';
import { PublishLabReportDto, ApproveLabReportDto } from './dto/lab-report.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(LabTest)
    private testRepo: Repository<LabTest>,
    @InjectRepository(LabOrder)
    private orderRepo: Repository<LabOrder>,
    @InjectRepository(LabSample)
    private sampleRepo: Repository<LabSample>,
    @InjectRepository(LabReport)
    private reportRepo: Repository<LabReport>,
    private auditService: AuditService,
  ) {}

  // Test Management
  async addLabTest(dto: CreateLabTestDto, userId: string): Promise<LabTest> {
    const test = this.testRepo.create({ ...dto, createdBy: userId });
    const saved = await this.testRepo.save(test);
    await this.auditService.logAccess({ action: 'LAB_CREATE_TEST', resourceType: 'LabTest', resourceId: saved.id, userId, details: { testCode: saved.testCode } });
    return saved;
  }

  async getLabTest(id: string): Promise<LabTest> {
    const test = await this.testRepo.findOne({ where: { id } });
    if (!test) throw new NotFoundException('Lab test not found');
    return test;
  }

  async listLabTests(): Promise<LabTest[]> {
    return this.testRepo.find();
  }

  // Order Management
  async createOrder(dto: CreateLabOrderDto, userId: string): Promise<LabOrder> {
    const test = await this.getLabTest(dto.testId);
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const order = this.orderRepo.create({
      orderNumber,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      doctorId: dto.doctorId,
      testId: dto.testId,
      requiredDate: new Date(dto.requiredDate),
      status: 'pending',
      notes: dto.notes,
      createdBy: userId,
    });

    const saved = await this.orderRepo.save(order);
    await this.auditService.logAccess({ action: 'LAB_CREATE_ORDER', resourceType: 'LabOrder', resourceId: saved.id, userId, details: { orderNumber: saved.orderNumber, testId: test.testCode } });
    return saved;
  }

  async getOrder(id: string): Promise<LabOrder> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Lab order not found');
    return order;
  }

  async listOrdersForPatient(patientId: string): Promise<LabOrder[]> {
    return this.orderRepo.find({ where: { patientId }, order: { orderDate: 'DESC' } });
  }

  async updateOrderStatus(id: string, dto: UpdateLabOrderStatusDto, userId: string): Promise<LabOrder> {
    const order = await this.getOrder(id);
    order.status = dto.status;
    if (dto.notes) order.notes = dto.notes;
    const updated = await this.orderRepo.save(order);
    await this.auditService.logAccess({ action: 'LAB_UPDATE_ORDER_STATUS', resourceType: 'LabOrder', resourceId: id, userId, details: { status: dto.status } });
    return updated;
  }

  // Sample Collection
  async collectSample(dto: CollectSampleDto, userId: string): Promise<LabSample> {
    const order = await this.getOrder(dto.orderId);
    if (order.status !== 'pending') {
      throw new BadRequestException('Order must be pending to collect sample');
    }

    const sampleCode = `SAMP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const sample = this.sampleRepo.create({
      orderId: dto.orderId,
      sampleCode,
      collectionDate: new Date(dto.collectionDate),
      collectorId: userId,
      sampleQuality: dto.sampleQuality || 'good',
      notes: dto.notes,
    });

    const saved = await this.sampleRepo.save(sample);

    // Update order status
    order.status = 'sample_collected';
    await this.orderRepo.save(order);

    await this.auditService.logAccess({ action: 'LAB_COLLECT_SAMPLE', resourceType: 'LabSample', resourceId: saved.id, userId, details: { sampleCode: saved.sampleCode } });
    return saved;
  }

  async getSample(id: string): Promise<LabSample> {
    const sample = await this.sampleRepo.findOne({ where: { id } });
    if (!sample) throw new NotFoundException('Lab sample not found');
    return sample;
  }

  async getSampleByOrderId(orderId: string): Promise<LabSample | null> {
    return this.sampleRepo.findOne({ where: { orderId } });
  }

  // Report Publishing
  async publishReport(dto: PublishLabReportDto, userId: string): Promise<LabReport> {
    const order = await this.getOrder(dto.orderId);
    if (order.status !== 'sample_collected') {
      throw new BadRequestException('Sample must be collected before publishing report');
    }

    const reportNumber = `RPT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const report = this.reportRepo.create({
      orderId: dto.orderId,
      reportNumber,
      results: dto.results,
      interpretation: dto.interpretation,
      referenceRange: dto.referenceRange,
      status: 'draft',
      createdBy: userId,
    });

    const saved = await this.reportRepo.save(report);

    // Update order status
    order.status = 'processing';
    await this.orderRepo.save(order);

    await this.auditService.logAccess({ action: 'LAB_PUBLISH_REPORT', resourceType: 'LabReport', resourceId: saved.id, userId, details: { reportNumber: saved.reportNumber } });
    return saved;
  }

  async approveReport(id: string, dto: ApproveLabReportDto, userId: string, role: string): Promise<LabReport> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Lab report not found');

    // Only pathologists/supervisors can approve
    if (role !== 'ADMIN' && role !== 'PATHOLOGIST' && role !== 'LAB_MANAGER') {
      throw new ForbiddenException('Only PATHOLOGIST or LAB_MANAGER can approve reports');
    }

    report.status = 'approved';
    report.approvedBy = userId;
    report.approvalDate = new Date();
    const updated = await this.reportRepo.save(report);

    // Update order status
    const order = await this.getOrder(report.orderId);
    order.status = 'report_ready';
    await this.orderRepo.save(order);

    await this.auditService.logAccess({ action: 'LAB_APPROVE_REPORT', resourceType: 'LabReport', resourceId: id, userId, details: { status: 'approved' } });
    return updated;
  }

  async publishApprovedReport(id: string, userId: string): Promise<LabReport> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Lab report not found');

    if (report.status !== 'approved') {
      throw new BadRequestException('Report must be approved before publishing');
    }

    report.status = 'published';
    report.publishedAt = new Date();
    const updated = await this.reportRepo.save(report);

    // Update order status
    const order = await this.getOrder(report.orderId);
    order.status = 'completed';
    await this.orderRepo.save(order);

    await this.auditService.logAccess({ action: 'LAB_PUBLISH_APPROVED_REPORT', resourceType: 'LabReport', resourceId: id, userId, details: { status: 'published' } });
    return updated;
  }

  async getReport(id: string): Promise<LabReport> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Lab report not found');
    return report;
  }

  async getReportByOrderId(orderId: string): Promise<LabReport | null> {
    return this.reportRepo.findOne({ where: { orderId } });
  }

  // Billing Linkage: Create pending billing entry for lab service
  async getBillingAmount(orderId: string): Promise<{ orderId: string; testId: string; amount: number }> {
    const order = await this.getOrder(orderId);
    const test = await this.getLabTest(order.testId);
    return { orderId, testId: order.testId, amount: test.cost };
  }
}
