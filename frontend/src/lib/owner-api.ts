import { internalClient } from "./internal-api";

export interface OwnerRange {
  from?: string;
  to?: string;
}

export async function getDailyRevenue(date?: string) {
  const res = await internalClient.get("/owner/reports/daily-revenue", { params: { date } });
  return res.data;
}

export async function getMonthlyRevenue(month?: string) {
  const res = await internalClient.get("/owner/reports/monthly-revenue", { params: { month } });
  return res.data;
}

export async function getRevenueByDoctor(range: OwnerRange = {}) {
  const res = await internalClient.get("/owner/reports/revenue-by-doctor", { params: range });
  return res.data || [];
}

export async function getRevenueByDepartment(range: OwnerRange = {}) {
  const res = await internalClient.get("/owner/reports/revenue-by-department", { params: range });
  return res.data || [];
}

export async function getExpensesSummary(range: OwnerRange = {}) {
  const res = await internalClient.get("/owner/reports/expenses-summary", { params: range });
  return res.data;
}

export async function getPharmacyRevenue(range: OwnerRange = {}) {
  const res = await internalClient.get("/owner/reports/pharmacy-revenue", { params: range });
  return res.data;
}

export async function getDiscountsSummary(range: OwnerRange = {}) {
  const res = await internalClient.get("/owner/reports/discounts-summary", { params: range });
  return res.data;
}
