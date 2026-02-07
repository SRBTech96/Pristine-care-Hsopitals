import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceLineItem } from '../entities/invoice-line-item.entity';
import { Payment } from '../entities/payment.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, AddLineItemDto, InvoiceResponseDto } from './dto/invoice.dto';
import { CreatePaymentDto, UpdatePaymentStatusDto, PaymentResponseDto } from './dto/payment.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceLineItem) private lineItemRepo: Repository<InvoiceLineItem>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private auditService: AuditService,
  ) {}

  /**
   * Create invoice from appointment/lab order/pharmacy sale
   */
  async createInvoice(dto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    // Generate unique invoice number
    const invoiceNumber = this.generateInvoiceNumber();
    
    const totalAmount = dto.subtotal + dto.taxAmount - (dto.discountAmount || 0);
    
    const invoice = this.invoiceRepo.create({
      invoiceNumber,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      subtotal: dto.subtotal,
      taxAmount: dto.taxAmount,
      discountAmount: dto.discountAmount || 0,
      discountApprovalId: dto.discountApprovalId,
      totalAmount,
      balanceDue: totalAmount,
      paidAmount: 0,
      status: 'draft',
      invoiceDate: dto.invoiceDate,
      dueDate: dto.dueDate,
      notes: dto.notes,
      createdBy: userId,
    });

    const saved = await this.invoiceRepo.save(invoice);

    await this.auditService.logAccess({
      userId,
      action: 'CREATE_INVOICE',
      entityType: 'Invoice',
      entityId: saved.id,
      details: { invoiceNumber: saved.invoiceNumber, totalAmount },
    });

    return saved;
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  /**
   * List invoices with filters
   */
  async listInvoices(
    filters?: {
      status?: string;
      patientId?: string;
      from?: Date;
      to?: Date;
    },
  ): Promise<Invoice[]> {
    let query = this.invoiceRepo.createQueryBuilder('inv');

    if (filters?.status) {
      query = query.where('inv.status = :status', { status: filters.status });
    }
    if (filters?.patientId) {
      query = query.andWhere('inv.patientId = :patientId', { patientId: filters.patientId });
    }
    if (filters?.from) {
      query = query.andWhere('inv.invoiceDate >= :from', { from: filters.from });
    }
    if (filters?.to) {
      query = query.andWhere('inv.invoiceDate <= :to', { to: filters.to });
    }

    return query.orderBy('inv.invoiceDate', 'DESC').getMany();
  }

  /**
   * Update invoice (before issued)
   */
  async updateInvoice(id: string, dto: UpdateInvoiceDto, userId: string, role: string): Promise<Invoice> {
    const invoice = await this.getInvoice(id);

    if (invoice.status !== 'draft' && invoice.status !== 'issued') {
      throw new BadRequestException('Cannot update invoice in current status');
    }

    // Only ADMIN/FINANCE can update
    if (role !== 'ADMIN' && role !== 'FINANCE') {
      throw new ForbiddenException('Only ADMIN or FINANCE role can update invoices');
    }

    if (dto.discountAmount !== undefined) {
      invoice.discountAmount = dto.discountAmount;
    }
    if (dto.discountApprovalId) {
      invoice.discountApprovalId = dto.discountApprovalId;
    }
    if (dto.dueDate) {
      invoice.dueDate = dto.dueDate;
    }
    if (dto.status) {
      invoice.status = dto.status;
    }
    if (dto.notes) {
      invoice.notes = dto.notes;
    }

    // Recalculate total and balance
    invoice.totalAmount = invoice.subtotal + invoice.taxAmount - invoice.discountAmount;
    invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;

    const updated = await this.invoiceRepo.save(invoice);

    await this.auditService.logAccess({
      userId,
      action: 'UPDATE_INVOICE',
      entityType: 'Invoice',
      entityId: id,
      details: { status: updated.status, balanceDue: updated.balanceDue },
    });

    return updated;
  }

  /**
   * Issue invoice (move from draft to issued)
   */
  async issueInvoice(id: string, userId: string, role: string): Promise<Invoice> {
    const invoice = await this.getInvoice(id);

    if (invoice.status !== 'draft') {
      throw new BadRequestException('Only draft invoices can be issued');
    }

    if (role !== 'ADMIN' && role !== 'FINANCE') {
      throw new ForbiddenException('Only ADMIN or FINANCE can issue invoices');
    }

    invoice.status = 'issued';
    const updated = await this.invoiceRepo.save(invoice);

    await this.auditService.logAccess({
      userId,
      action: 'ISSUE_INVOICE',
      entityType: 'Invoice',
      entityId: id,
      details: { invoiceNumber: updated.invoiceNumber, totalAmount: updated.totalAmount },
    });

    return updated;
  }

  /**
   * Add line item to invoice
   */
  async addLineItem(invoiceId: string, dto: AddLineItemDto, userId: string): Promise<InvoiceLineItem> {
    const invoice = await this.getInvoice(invoiceId);

    if (invoice.status !== 'draft') {
      throw new BadRequestException('Can only add line items to draft invoices');
    }

    const lineAmount = dto.quantity * dto.unitPrice;
    const taxAmount = dto.taxAmount || 0;
    const discountAmount = dto.discountAmount || 0;
    const totalLineAmount = lineAmount + taxAmount - discountAmount;

    const lineItem = this.lineItemRepo.create({
      invoiceId,
      lineType: dto.lineType,
      referenceId: dto.referenceId,
      description: dto.description,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      lineAmount,
      taxAmount,
      discountAmount,
      totalLineAmount,
      hsnCode: dto.hsnCode,
      createdBy: userId,
    });

    const saved = await this.lineItemRepo.save(lineItem);

    // Update invoice totals
    const lineItems = await this.lineItemRepo.find({ where: { invoiceId } });
    const totalSubtotal = lineItems.reduce((sum, item) => sum + item.lineAmount, 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalDiscount = lineItems.reduce((sum, item) => sum + item.discountAmount, 0);

    invoice.subtotal = totalSubtotal;
    invoice.taxAmount = totalTax;
    invoice.discountAmount = totalDiscount;
    invoice.totalAmount = totalSubtotal + totalTax - totalDiscount;
    invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;

    await this.invoiceRepo.save(invoice);

    await this.auditService.logAccess({
      userId,
      action: 'ADD_LINE_ITEM',
      entityType: 'InvoiceLineItem',
      entityId: saved.id,
      details: { invoiceId, description: dto.description, amount: totalLineAmount },
    });

    return saved;
  }

  /**
   * Get line items for invoice
   */
  async getLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
    return this.lineItemRepo.find({
      where: { invoiceId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Remove line item
   */
  async removeLineItem(id: string, userId: string): Promise<void> {
    const lineItem = await this.lineItemRepo.findOne({ where: { id } });
    if (!lineItem) throw new NotFoundException('Line item not found');

    const invoice = await this.getInvoice(lineItem.invoiceId);
    if (invoice.status !== 'draft') {
      throw new BadRequestException('Can only remove line items from draft invoices');
    }

    await this.lineItemRepo.remove(lineItem);

    // Recalculate invoice totals
    const lineItems = await this.lineItemRepo.find({ where: { invoiceId: invoice.id } });
    const totalSubtotal = lineItems.reduce((sum, item) => sum + item.lineAmount, 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalDiscount = lineItems.reduce((sum, item) => sum + item.discountAmount, 0);

    invoice.subtotal = totalSubtotal;
    invoice.taxAmount = totalTax;
    invoice.discountAmount = totalDiscount;
    invoice.totalAmount = totalSubtotal + totalTax - totalDiscount;
    invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;

    await this.invoiceRepo.save(invoice);

    await this.auditService.logAccess({
      userId,
      action: 'REMOVE_LINE_ITEM',
      entityType: 'InvoiceLineItem',
      entityId: id,
      details: { invoiceId: invoice.id },
    });
  }

  /**
   * Record payment against invoice
   */
  async recordPayment(dto: CreatePaymentDto, userId: string, role: string): Promise<Payment> {
    const invoice = await this.getInvoice(dto.invoiceId);

    if (invoice.status === 'cancelled' || invoice.status === 'draft') {
      throw new BadRequestException('Cannot record payment for invoice in current status');
    }

    // Only ADMIN/FINANCE/CASHIER can record payments
    if (role !== 'ADMIN' && role !== 'FINANCE' && role !== 'CASHIER') {
      throw new ForbiddenException('Only ADMIN, FINANCE, or CASHIER can record payments');
    }

    // Validate payment amount
    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    if (invoice.balanceDue && dto.amount > invoice.balanceDue) {
      throw new BadRequestException(`Payment exceeds invoice balance. Balance due: ${invoice.balanceDue}`);
    }

    const paymentNumber = this.generatePaymentNumber();

    const payment = this.paymentRepo.create({
      paymentNumber,
      invoiceId: dto.invoiceId,
      patientId: invoice.patientId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      referenceNumber: dto.referenceNumber,
      paymentDate: dto.paymentDate,
      status: 'pending',
      notes: dto.notes,
      receivedBy: dto.receivedBy || userId,
      createdBy: userId,
    });

    const saved = await this.paymentRepo.save(payment);

    // Update invoice payment tracking
    invoice.paidAmount += dto.amount;
    invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;

    // Update invoice status
    if (invoice.balanceDue <= 0) {
      invoice.status = 'fully_paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partially_paid';
    }

    await this.invoiceRepo.save(invoice);

    await this.auditService.logAccess({
      userId,
      action: 'RECORD_PAYMENT',
      entityType: 'Payment',
      entityId: saved.id,
      details: {
        paymentNumber: saved.paymentNumber,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        method: dto.paymentMethod,
        balanceDue: invoice.balanceDue,
      },
    });

    return saved;
  }

  /**
   * Get payment by ID
   */
  async getPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  /**
   * List payments for invoice
   */
  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { invoiceId },
      order: { paymentDate: 'DESC' },
    });
  }

  /**
   * Update payment status (complete/refund)
   */
  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto, userId: string, role: string): Promise<Payment> {
    const payment = await this.getPayment(id);

    if (role !== 'ADMIN' && role !== 'FINANCE') {
      throw new ForbiddenException('Only ADMIN or FINANCE can update payment status');
    }

    const oldStatus = payment.status;
    payment.status = dto.status;
    payment.processedBy = userId;
    payment.processedAt = new Date();
    if (dto.notes) payment.notes = dto.notes;

    const updated = await this.paymentRepo.save(payment);

    // If payment was marked as refunded, adjust invoice
    if (dto.status === 'refunded') {
      const invoice = await this.getInvoice(payment.invoiceId);
      invoice.paidAmount -= payment.amount;
      invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;

      if (invoice.paidAmount <= 0) {
        invoice.status = 'issued';
      } else if (invoice.paidAmount < invoice.totalAmount) {
        invoice.status = 'partially_paid';
      }

      await this.invoiceRepo.save(invoice);
    }

    await this.auditService.logAccess({
      userId,
      action: 'UPDATE_PAYMENT_STATUS',
      entityType: 'Payment',
      entityId: id,
      details: { oldStatus, newStatus: dto.status, amount: payment.amount },
    });

    return updated;
  }

  /**
   * Get billing summary for patient
   */
  async getPatientBillingSummary(patientId: string): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    invoiceCount: number;
    paymentCount: number;
  }> {
    const invoices = await this.invoiceRepo.find({ where: { patientId } });
    const payments = await this.paymentRepo.find({ where: { patientId, status: 'completed' } });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      invoiceCount: invoices.length,
      paymentCount: payments.length,
    };
  }

  /**
   * Get billing report for date range
   */
  async getBillingReport(from: Date, to: Date): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    invoicesByStatus: Record<string, number>;
    paymentsByMethod: Record<string, number>;
  }> {
    const invoices = await this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.invoiceDate >= :from AND inv.invoiceDate <= :to', { from, to })
      .getMany();

    const payments = await this.paymentRepo
      .createQueryBuilder('pay')
      .where('pay.paymentDate >= :from AND pay.paymentDate <= :to', { from, to })
      .andWhere('pay.status = :status', { status: 'completed' })
      .getMany();

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    // Count invoices by status
    const invoicesByStatus = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count payments by method  
    const paymentsByMethod = payments.reduce((acc, pay) => {
      acc[pay.paymentMethod] = (acc[pay.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      invoicesByStatus,
      paymentsByMethod,
    };
  }

  /**
   * Generate unique invoice number
   */
  private generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `INV-${year}-${month}-${random}`;
  }

  /**
   * Generate unique payment number
   */
  private generatePaymentNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `PAY-${year}-${month}-${random}`;
  }
}
