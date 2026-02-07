/**
 * Billing API Integration
 * Handles all operations related to invoices, line items, and payments
 */

import axios, { AxiosInstance } from "axios";
import {
  Invoice,
  Payment,
  InvoiceLineItem,
  Patient,
  CreateInvoiceInput,
  CreatePaymentInput,
  ApiResponse,
} from "@/types";
import { apiCache } from "./api-cache";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class BillingApiClient {
  private client: AxiosInstance;
  private cacheEnabled: boolean = true;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // ==================== PATIENTS ====================

  /**
   * Search patients by name or ID
   */
  async searchPatients(query: string): Promise<Patient[]> {
    const cacheKey = `patients:search:${query.toLowerCase()}`;

    try {
      const response = await this.client.get<ApiResponse<Patient[]>>("/patients", {
        params: { search: query },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to search patients:", error);
      return [];
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(patientId: string): Promise<Patient | null> {
    const cacheKey = `patient:${patientId}`;

    try {
      const response = await this.client.get<ApiResponse<Patient>>(
        `/patients/${patientId}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to fetch patient ${patientId}:`, error);
      return null;
    }
  }

  // ==================== INVOICES ====================

  /**
   * Get all invoices with filters
   */
  async getInvoices(filters?: {
    status?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<Invoice[]> {
    try {
      const response = await this.client.get<ApiResponse<Invoice[]>>(
        "/invoices",
        { params: filters }
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      return [];
    }
  }

  /**
   * Get invoice by ID with all details
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const response = await this.client.get<ApiResponse<Invoice>>(
        `/invoices/${invoiceId}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to fetch invoice ${invoiceId}:`, error);
      return null;
    }
  }

  /**
   * Create new invoice
   */
  async createInvoice(data: CreateInvoiceInput): Promise<Invoice | null> {
    try {
      // Validate input
      if (!data.patientId || !data.lineItems || data.lineItems.length === 0) {
        throw new Error("Invalid invoice data: patient and line items required");
      }

      // Calculate totals
      let subtotal = 0;
      let taxAmount = 0;

      for (const item of data.lineItems) {
        const itemTotal = item.quantity * item.unitPrice;
        const tax = itemTotal * (item.taxRate / 100);
        subtotal += itemTotal;
        taxAmount += tax;
      }

      const total = subtotal + taxAmount - (data.discountAmount || 0);

      const response = await this.client.post<ApiResponse<Invoice>>(
        "/invoices",
        {
          patientId: data.patientId,
          lineItems: data.lineItems,
          subtotal,
          taxAmount,
          discountAmount: data.discountAmount || 0,
          totalAmount: total,
          paidAmount: 0,
          dueAmount: total,
          status: "draft",
          notes: data.notes,
        }
      );

      // Invalidate cache
      this.invalidateInvoiceCache();

      return response.data.data || null;
    } catch (error) {
      console.error("Failed to create invoice:", error);
      throw error;
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(
    invoiceId: string,
    data: Partial<Invoice>
  ): Promise<Invoice | null> {
    try {
      const response = await this.client.put<ApiResponse<Invoice>>(
        `/invoices/${invoiceId}`,
        data
      );

      // Invalidate cache
      this.invalidateInvoiceCache();

      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to update invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(invoiceId: string): Promise<boolean> {
    try {
      await this.client.delete(`/invoices/${invoiceId}`);
      this.invalidateInvoiceCache();
      return true;
    } catch (error) {
      console.error(`Failed to delete invoice ${invoiceId}:`, error);
      return false;
    }
  }

  // ==================== LINE ITEMS ====================

  /**
   * Add line item to invoice
   */
  async addLineItem(
    invoiceId: string,
    item: Omit<InvoiceLineItem, "id" | "invoiceId" | "total" | "createdAt" | "updatedAt">
  ): Promise<InvoiceLineItem | null> {
    try {
      const total = item.quantity * item.unitPrice * (1 + item.taxRate / 100);

      const response = await this.client.post<ApiResponse<InvoiceLineItem>>(
        `/invoices/${invoiceId}/line-items`,
        { ...item, total }
      );

      this.invalidateInvoiceCache();
      return response.data.data || null;
    } catch (error) {
      console.error("Failed to add line item:", error);
      throw error;
    }
  }

  /**
   * Update line item
   */
  async updateLineItem(
    invoiceId: string,
    itemId: string,
    data: Partial<InvoiceLineItem>
  ): Promise<InvoiceLineItem | null> {
    try {
      const response = await this.client.put<ApiResponse<InvoiceLineItem>>(
        `/invoices/${invoiceId}/line-items/${itemId}`,
        data
      );

      this.invalidateInvoiceCache();
      return response.data.data || null;
    } catch (error) {
      console.error("Failed to update line item:", error);
      throw error;
    }
  }

  /**
   * Delete line item
   */
  async deleteLineItem(invoiceId: string, itemId: string): Promise<boolean> {
    try {
      await this.client.delete(
        `/invoices/${invoiceId}/line-items/${itemId}`
      );

      this.invalidateInvoiceCache();
      return true;
    } catch (error) {
      console.error("Failed to delete line item:", error);
      return false;
    }
  }

  // ==================== PAYMENTS ====================

  /**
   * Create payment for invoice
   */
  async createPayment(data: CreatePaymentInput): Promise<Payment | null> {
    try {
      // Validate input
      if (!data.invoiceId || !data.amount || !data.paymentMethod) {
        throw new Error("Invalid payment data: invoice, amount, and method required");
      }

      const response = await this.client.post<ApiResponse<Payment>>(
        "/payments",
        data
      );

      // Invalidate caches
      this.invalidateInvoiceCache();
      apiCache.invalidatePattern("^invoices?:");

      return response.data.data || null;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw error;
    }
  }

  /**
   * Get payments for invoice
   */
  async getPayments(invoiceId: string): Promise<Payment[]> {
    try {
      const response = await this.client.get<ApiResponse<Payment[]>>(
        `/invoices/${invoiceId}/payments`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      return [];
    }
  }

  /**
   * Delete payment (refund)
   */
  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      await this.client.delete(`/payments/${paymentId}`);
      this.invalidateInvoiceCache();
      return true;
    } catch (error) {
      console.error("Failed to delete payment:", error);
      return false;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Invalidate invoice cache
   */
  private invalidateInvoiceCache(): void {
    apiCache.invalidatePattern("^invoice(s)?:");
  }

  /**
   * Calculate invoice totals
   */
  calculateTotals(lineItems: InvoiceLineItem[], discountAmount: number = 0) {
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of lineItems) {
      const itemSubtotal = item.quantity * item.unitPrice;
      const tax = itemSubtotal * (item.taxRate / 100);
      subtotal += itemSubtotal;
      taxAmount += tax;
    }

    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Generate invoice number
   */
  generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(5, "0");
    return `INV-${year}${month}-${random}`;
  }

  /**
   * Check payment status
   */
  getPaymentStatus(invoice: Invoice): "paid" | "partial" | "pending" {
    if (invoice.paidAmount === 0) return "pending";
    if (invoice.paidAmount >= invoice.totalAmount) return "paid";
    return "partial";
  }
}

export const billingApi = new BillingApiClient();
