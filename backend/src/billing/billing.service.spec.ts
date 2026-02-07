import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceLineItem } from '../entities/invoice-line-item.entity';
import { Payment } from '../entities/payment.entity';
import { AuditService } from '../audit/audit.service';

describe('BillingService', () => {
  let service: BillingService;
  let mockInvoiceRepo: any;
  let mockLineItemRepo: any;
  let mockPaymentRepo: any;
  let mockAuditService: any;

  beforeEach(async () => {
    mockInvoiceRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockLineItemRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    mockPaymentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockAuditService = {
      logAccess: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepo,
        },
        {
          provide: getRepositoryToken(InvoiceLineItem),
          useValue: mockLineItemRepo,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepo,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      const dto = {
        patientId: 'patient-123',
        subtotal: 10000,
        taxAmount: 2000,
        discountAmount: 1000,
        invoiceDate: new Date(),
        dueDate: new Date(),
      };

      const mockInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-02-12345',
        ...dto,
        totalAmount: 11000,
        balanceDue: 11000,
        paidAmount: 0,
        status: 'draft',
        createdBy: 'user-1',
      };

      mockInvoiceRepo.create.mockReturnValue(mockInvoice);
      mockInvoiceRepo.save.mockResolvedValue(mockInvoice);

      const result = await service.createInvoice(dto, 'user-1');

      expect(mockInvoiceRepo.create).toHaveBeenCalled();
      expect(mockInvoiceRepo.save).toHaveBeenCalled();
      expect(mockAuditService.logAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'CREATE_INVOICE',
          entityType: 'Invoice',
        }),
      );
      expect(result.status).toBe('draft');
      expect(result.totalAmount).toBe(11000);
    });
  });

  describe('recordPayment', () => {
    it('should record payment against invoice', async () => {
      const invoice = {
        id: 'inv-1',
        totalAmount: 10000,
        paidAmount: 0,
        balanceDue: 10000,
        status: 'issued',
        patientId: 'patient-123',
        invoiceDate: new Date(),
      };

      const paymentDto = {
        invoiceId: 'inv-1',
        amount: 5000,
        paymentMethod: 'cash',
        paymentDate: new Date(),
      };

      const mockPayment = {
        id: 'pay-1',
        paymentNumber: 'PAY-2026-02-54321',
        ...paymentDto,
        status: 'pending',
        createdBy: 'user-1',
      };

      mockInvoiceRepo.findOne.mockResolvedValue(invoice);
      mockPaymentRepo.create.mockReturnValue(mockPayment);
      mockPaymentRepo.save.mockResolvedValue(mockPayment);
      mockInvoiceRepo.save.mockResolvedValue({
        ...invoice,
        paidAmount: 5000,
        balanceDue: 5000,
        status: 'partially_paid',
      });

      const result = await service.recordPayment(paymentDto, 'user-1', 'FINANCE');

      expect(mockPaymentRepo.create).toHaveBeenCalled();
      expect(mockPaymentRepo.save).toHaveBeenCalled();
      expect(mockInvoiceRepo.save).toHaveBeenCalled();
      expect(mockAuditService.logAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'RECORD_PAYMENT',
        }),
      );
      expect(result.status).toBe('pending');
    });

    it('should reject payment if amount exceeds balance', async () => {
      const invoice = {
        id: 'inv-1',
        totalAmount: 10000,
        paidAmount: 0,
        balanceDue: 10000,
        status: 'issued',
      };

      const paymentDto = {
        invoiceId: 'inv-1',
        amount: 15000, // Exceeds balance
        paymentMethod: 'cash',
        paymentDate: new Date(),
      };

      mockInvoiceRepo.findOne.mockResolvedValue(invoice);

      await expect(
        service.recordPayment(paymentDto, 'user-1', 'FINANCE'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject payment if user role is insufficient', async () => {
      const invoice = {
        id: 'inv-1',
        totalAmount: 10000,
        status: 'issued',
      };

      const paymentDto = {
        invoiceId: 'inv-1',
        amount: 5000,
        paymentMethod: 'cash',
        paymentDate: new Date(),
      };

      mockInvoiceRepo.findOne.mockResolvedValue(invoice);

      await expect(
        service.recordPayment(paymentDto, 'user-1', 'STAFF'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addLineItem', () => {
    it('should add line item to invoice', async () => {
      const invoice = {
        id: 'inv-1',
        status: 'draft',
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        paidAmount: 0,
      };

      const lineItemDto = {
        lineType: 'service',
        description: 'Consultation',
        quantity: 1,
        unitPrice: 5000,
        taxAmount: 1000,
        hsnCode: '998411',
      };

      const mockLineItem = {
        id: 'li-1',
        invoiceId: 'inv-1',
        ...lineItemDto,
        lineAmount: 5000,
        discountAmount: 0,
        createdBy: 'user-1',
      };

      mockInvoiceRepo.findOne.mockResolvedValue(invoice);
      mockLineItemRepo.create.mockReturnValue(mockLineItem);
      mockLineItemRepo.save.mockResolvedValue(mockLineItem);
      mockLineItemRepo.find.mockResolvedValue([mockLineItem]);
      mockInvoiceRepo.save.mockResolvedValue({
        ...invoice,
        subtotal: 5000,
        taxAmount: 1000,
        totalAmount: 6000,
      });

      const result = await service.addLineItem('inv-1', lineItemDto, 'user-1');

      expect(mockLineItemRepo.create).toHaveBeenCalled();
      expect(mockLineItemRepo.save).toHaveBeenCalled();
      expect(mockInvoiceRepo.save).toHaveBeenCalled();
      expect(mockAuditService.logAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'ADD_LINE_ITEM',
        }),
      );
    });

    it('should reject adding line item to non-draft invoice', async () => {
      const invoice = {
        id: 'inv-1',
        status: 'issued',
      };

      const lineItemDto = {
        lineType: 'service',
        description: 'Consultation',
        quantity: 1,
        unitPrice: 5000,
        hsnCode: '998411',
      };

      mockInvoiceRepo.findOne.mockResolvedValue(invoice);

      await expect(
        service.addLineItem('inv-1', lineItemDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status to completed', async () => {
      const payment = {
        id: 'pay-1',
        invoiceId: 'inv-1',
        amount: 5000,
        status: 'pending',
      };

      const updateDto = {
        status: 'completed',
      };

      mockPaymentRepo.findOne.mockResolvedValue(payment);
      mockPaymentRepo.save.mockResolvedValue({
        ...payment,
        status: 'completed',
        processedBy: 'user-1',
        processedAt: new Date(),
      });

      const result = await service.updatePaymentStatus(
        'pay-1',
        updateDto,
        'user-1',
        'FINANCE',
      );

      expect(mockPaymentRepo.save).toHaveBeenCalled();
      expect(mockAuditService.logAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'UPDATE_PAYMENT_STATUS',
        }),
      );
      expect(result.status).toBe('completed');
    });

    it('should reject status update if user role is insufficient', async () => {
      const payment = {
        id: 'pay-1',
        status: 'pending',
      };

      const updateDto = {
        status: 'completed',
      };

      mockPaymentRepo.findOne.mockResolvedValue(payment);

      await expect(
        service.updatePaymentStatus('pay-1', updateDto, 'user-1', 'STAFF'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPatientBillingSummary', () => {
    it('should return patient billing summary', async () => {
      const invoices = [
        {
          patientId: 'patient-1',
          totalAmount: 10000,
          balanceDue: 5000,
        },
        {
          patientId: 'patient-1',
          totalAmount: 5000,
          balanceDue: 0,
        },
      ];

      const payments = [
        {
          patientId: 'patient-1',
          amount: 5000,
          status: 'completed',
        },
        {
          patientId: 'patient-1',
          amount: 5000,
          status: 'completed',
        },
      ];

      mockInvoiceRepo.find.mockResolvedValue(invoices);
      mockPaymentRepo.find.mockResolvedValue(payments);

      const result = await service.getPatientBillingSummary('patient-1');

      expect(result.totalInvoiced).toBe(15000);
      expect(result.totalPaid).toBe(10000);
      expect(result.totalOutstanding).toBe(5000);
      expect(result.invoiceCount).toBe(2);
      expect(result.paymentCount).toBe(2);
    });
  });
});
