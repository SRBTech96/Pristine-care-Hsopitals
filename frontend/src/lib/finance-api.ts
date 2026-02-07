import axios from "axios";

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
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getDailyRevenue(startDate?: string, endDate?: string) {
    const res = await this.client.get<RevenueSummary[]>(`/reports/revenue/daily`, {
      params: { startDate, endDate },
    });
    return res.data;
  }

  async getMonthlyRevenue(year?: number) {
    const res = await this.client.get<RevenueSummary[]>(`/reports/revenue/monthly`, {
      params: { year },
    });
    return res.data;
  }

  async getRevenueByDoctor(startDate?: string, endDate?: string) {
    const res = await this.client.get<RevenueByEntity[]>(`/reports/revenue/by-doctor`, {
      params: { startDate, endDate },
    });
    return res.data;
  }

  async getRevenueByDepartment(startDate?: string, endDate?: string) {
    const res = await this.client.get<RevenueByEntity[]>(`/reports/revenue/by-department`, {
      params: { startDate, endDate },
    });
    return res.data;
  }

  async getExpenses(startDate?: string, endDate?: string) {
    const res = await this.client.get<RevenueSummary[]>(`/reports/expenses`, {
      params: { startDate, endDate },
    });
    return res.data;
  }

  async getPnL(startDate?: string, endDate?: string) {
    const res = await this.client.get<{ revenue: number; expenses: number; profit: number }>(`/reports/pnl`, {
      params: { startDate, endDate },
    });
    return res.data;
  }

  // Export endpoints (server will prepare files)
  async exportReportPdf(report: string, params: Record<string, any>) {
    const res = await this.client.post(`/reports/export/pdf/${report}`, params, { responseType: "blob" });
    return res.data;
  }

  async exportReportExcel(report: string, params: Record<string, any>) {
    const res = await this.client.post(`/reports/export/excel/${report}`, params, { responseType: "blob" });
    return res.data;
  }
}

export const financeApi = new FinanceApiClient();

export default FinanceApiClient;
