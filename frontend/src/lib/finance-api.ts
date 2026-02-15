import axios from "axios";
import { CORE_API_BASE_URL } from "./api-config";

export interface RevenueByEntity {
  key: string;
  amount: number;
}

export interface RevenueSummary {
  date: string;
  total: number;
}

class FinanceApiClient {
  client: ReturnType<typeof axios.create>;

  constructor() {
    this.client = axios.create({
      baseURL: CORE_API_BASE_URL,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });
  }

  private toDateKey(value: string | Date): string {
    const d = new Date(value);
    return d.toISOString().slice(0, 10);
  }

  private toMonthKey(value: string | Date): string {
    const d = new Date(value);
    return d.toISOString().slice(0, 7);
  }

  private async listRevenue(startDate?: string, endDate?: string) {
    const res = await this.client.get<any[]>(`/finance/revenues`, {
      params: { from: startDate, to: endDate },
    });
    return res.data || [];
  }

  private async listExpenses(startDate?: string, endDate?: string) {
    const res = await this.client.get<any[]>(`/finance/expenses`, {
      params: { from: startDate, to: endDate },
    });
    return res.data || [];
  }

  async getDailyRevenue(startDate?: string, endDate?: string) {
    const rows = await this.listRevenue(startDate, endDate);
    const totals = new Map<string, number>();
    rows.forEach((r) => {
      const key = this.toDateKey(r.paymentDate);
      totals.set(key, (totals.get(key) || 0) + Number(r.finalAmount || 0));
    });
    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));
  }

  async getMonthlyRevenue(year?: number) {
    const from = year ? `${year}-01-01` : undefined;
    const to = year ? `${year}-12-31` : undefined;
    const rows = await this.listRevenue(from, to);
    const totals = new Map<string, number>();
    rows.forEach((r) => {
      const key = this.toMonthKey(r.paymentDate);
      totals.set(key, (totals.get(key) || 0) + Number(r.finalAmount || 0));
    });
    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));
  }

  async getRevenueByDoctor(startDate?: string, endDate?: string) {
    const res = await this.client.get<any[]>(`/finance/reports/doctor`, {
      params: { from: startDate, to: endDate },
    });
    return (res.data || []).map((row) => ({
      key: row.doctorId,
      amount: Number(row.total || 0),
    }));
  }

  async getRevenueByDepartment(startDate?: string, endDate?: string) {
    const res = await this.client.get<any[]>(`/finance/reports/department`, {
      params: { from: startDate, to: endDate },
    });
    return (res.data || []).map((row) => ({
      key: row.departmentId,
      amount: Number(row.total || 0),
    }));
  }

  async getExpenses(startDate?: string, endDate?: string) {
    const rows = await this.listExpenses(startDate, endDate);
    const totals = new Map<string, number>();
    rows.forEach((e) => {
      const key = this.toDateKey(e.expenseDate);
      totals.set(key, (totals.get(key) || 0) + Number(e.amount || 0));
    });
    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));
  }

  async getPnL(startDate?: string, endDate?: string) {
    const [revenues, expenses] = await Promise.all([
      this.listRevenue(startDate, endDate),
      this.listExpenses(startDate, endDate),
    ]);
    const revenueTotal = revenues.reduce((sum, r) => sum + Number(r.finalAmount || 0), 0);
    const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return {
      revenue: revenueTotal,
      expenses: expenseTotal,
      profit: revenueTotal - expenseTotal,
    };
  }

  // Export endpoints (server will prepare files)
  async exportReportPdf(report: string, params: Record<string, any>): Promise<Blob> {
    const res = await this.client.get(`/finance/reports/${report}/export/pdf`, {
      params,
      responseType: "blob",
    });
    return res.data as Blob;
  }

  async exportReportExcel(report: string, params: Record<string, any>): Promise<Blob> {
    const res = await this.client.get(`/finance/reports/${report}/export/excel`, {
      params,
      responseType: "blob",
    });
    return res.data as Blob;
  }
}

export const financeApi = new FinanceApiClient();

export default FinanceApiClient;
