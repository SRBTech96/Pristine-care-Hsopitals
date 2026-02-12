import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceDto, AddLineItemDto, InvoiceResponseDto } from './dto/invoice.dto';
import { CreatePaymentDto, UpdatePaymentStatusDto, PaymentResponseDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../common/decorators/audit.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  /**
   * Create invoice
   */
  @Post('invoices')
  @Roles('ADMIN', 'FINANCE')
  @Auditable()
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.billingService.createInvoice(dto, user.id);
  }

  /**
   * Get invoice by ID
   */
  @Get('invoices/:id')
  @Roles('ADMIN', 'FINANCE', 'DOCTOR', 'STAFF', 'PATIENT', 'CASHIER')
  async getInvoice(@Param('id') id: string) {
    return this.billingService.getInvoice(id);
  }

  /**
   * List invoices with filters
   */
  @Get('invoices')
  @Roles('ADMIN', 'FINANCE', 'DOCTOR', 'STAFF', 'PATIENT', 'CASHIER')
  async listInvoices(
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.billingService.listInvoices({
      status,
      patientId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  /**
   * Update invoice (before issued)
   */
  @Patch('invoices/:id')
  @Roles('ADMIN', 'FINANCE')
  @Auditable()
  async updateInvoice(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.billingService.updateInvoice(id, dto, user.id, user.role);
  }

  /**
   * Issue invoice
   */
  @Patch('invoices/:id/issue')
  @Roles('ADMIN', 'FINANCE')
  @Auditable()
  async issueInvoice(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.billingService.issueInvoice(id, user.id, user.role);
  }

  /**
   * Add line item to invoice
   */
  @Post('invoices/:id/line-items')
  @Roles('ADMIN', 'FINANCE')
  @Auditable()
  async addLineItem(
    @Param('id') invoiceId: string,
    @Body() dto: AddLineItemDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.billingService.addLineItem(invoiceId, dto, user.id);
  }

  /**
   * Get line items for invoice
   */
  @Get('invoices/:id/line-items')
  @Roles('ADMIN', 'FINANCE', 'DOCTOR', 'STAFF', 'PATIENT')
  async getLineItems(@Param('id') invoiceId: string) {
    return this.billingService.getLineItems(invoiceId);
  }

  /**
   * Remove line item
   */
  @Patch('line-items/:id/remove')
  @Roles('ADMIN', 'FINANCE')
  @Auditable()
  async removeLineItem(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    await this.billingService.removeLineItem(id, user.id);
    return { message: 'Line item removed successfully' };
  }

  /**
   * Record payment against invoice
   */
  @Post('payments')
  @Roles('ADMIN', 'FINANCE', 'CASHIER')
  @Auditable()
  async recordPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.billingService.recordPayment(dto, user.id, user.role);
  }

  /**
   * Get payment by ID
   */
  @Get('payments/:id')
  @Roles('ADMIN', 'FINANCE', 'DOCTOR', 'STAFF', 'PATIENT', 'CASHIER')
  async getPayment(@Param('id') id: string) {
    return this.billingService.getPayment(id);
  }

  /**
   * Get payments for invoice
   */
  @Get('invoices/:id/payments')
  @Roles('ADMIN', 'FINANCE', 'DOCTOR', 'STAFF', 'PATIENT', 'CASHIER')
  async getInvoicePayments(@Param('id') invoiceId: string) {
    return this.billingService.getInvoicePayments(invoiceId);
  }

  /**
   * Update payment status
   */
  @Patch('payments/:id/status')
  @Roles('ADMIN', 'FINANCE')
  @Auditable()
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.billingService.updatePaymentStatus(id, dto, user.id, user.role);
  }

  /**
   * Get patient billing summary
   */
  @Get('patients/:patientId/summary')
  @Roles('ADMIN', 'FINANCE', 'DOCTOR', 'STAFF', 'PATIENT', 'CASHIER')
  async getPatientBillingSummary(@Param('patientId') patientId: string) {
    return this.billingService.getPatientBillingSummary(patientId);
  }

  /**
   * Get billing report for date range
   */
  @Get('reports/summary')
  @Roles('ADMIN', 'FINANCE', 'OWNER')
  async getBillingReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.billingService.getBillingReport(new Date(from), new Date(to));
  }
}
