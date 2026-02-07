export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualifications: string[];
  specialization: string;
  yearsOfExperience: number;
  registrationNumber?: string;
  bio?: string;
}

export interface DepartmentGroup {
  departmentName: string;
  specialization: string;
  doctors: Doctor[];
  icon?: string;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  message?: string;
}

// Billing Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  uhid?: string; // Unique Hospital ID
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percentage
  total: number;
  serviceType: "consultation" | "procedure" | "medication" | "investigation" | "bed_charge" | "other";
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: "cash" | "card" | "check" | "upi" | "bank_transfer";
  referenceNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  processedBy?: string; // User ID
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patient?: Patient;
  lineItems?: InvoiceLineItem[];
  payments?: Payment[];
  status: "draft" | "pending" | "partial" | "paid" | "cancelled";
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  invoiceDate: Date;
  dueDate?: Date;
  notes?: string;
  createdBy?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceInput {
  patientId: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    serviceType: string;
  }[];
  discountAmount?: number;
  notes?: string;
}

export interface CreatePaymentInput {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface BillingStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  paidToday: number;
}

export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT" | "FINANCE" | "CASHIER" | "LAB_MANAGER" | "PHARMACY_MANAGER" | "HR_MANAGER";
