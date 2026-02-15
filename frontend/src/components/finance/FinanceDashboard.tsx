"use client";

import React from "react";
import { SummaryCard } from "./SummaryCard";
import { Filters } from "./Filters";
import { RevenueTable, SimpleTable } from "./Tables";
import { ExportButtons } from "./ExportButtons";
import { financeApi } from "@/lib/finance-api";
import { getClientRole } from "@/lib/auth";
import type { ExportData, ExportFilters } from "@/lib/export-utils";

export const FinanceDashboard: React.FC = () => {
  const [filters, setFilters] = React.useState<ExportFilters>({});
  const [daily, setDaily] = React.useState<{ date: string; total: number }[]>([]);
  const [monthly, setMonthly] = React.useState<{ date: string; total: number }[]>([]);
  const [byDoctor, setByDoctor] = React.useState<{ key: string; amount: number }[]>([]);
  const [byDept, setByDept] = React.useState<{ key: string; amount: number }[]>([]);
  const [expenses, setExpenses] = React.useState<{ date: string; total: number }[]>([]);
  const [pnl, setPnl] = React.useState<{ revenue: number; expenses: number; profit: number } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const role = getClientRole();

  React.useEffect(() => {
    fetchAll();
  }, [filters]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, m, bd, bdpt, ex, p] = await Promise.all([
        financeApi.getDailyRevenue(filters.startDate, filters.endDate),
        financeApi.getMonthlyRevenue(),
        financeApi.getRevenueByDoctor(filters.startDate, filters.endDate),
        financeApi.getRevenueByDepartment(filters.startDate, filters.endDate),
        financeApi.getExpenses(filters.startDate, filters.endDate),
        financeApi.getPnL(filters.startDate, filters.endDate),
      ]);
      setDaily(d);
      setMonthly(m);
      setByDoctor(bd);
      setByDept(bdpt);
      setExpenses(ex);
      setPnl(p);
    } catch (err) {
      console.error(err);
      alert("Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Finance & Owner Dashboard</h1>
        <div className="flex items-center gap-3">
          <ExportButtons
            report="financial_overview"
            data={{
              dailyRevenue: daily,
              monthlyRevenue: monthly,
              revenueByDoctor: byDoctor,
              revenueByDepartment: byDept,
              expenses,
              pnl: pnl ?? undefined,
            }}
            filters={filters}
          />
        </div>
      </div>

      <Filters doctors={[]} departments={[]} onChange={(f) => setFilters(f)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Daily Revenue (last range)" amount={daily.reduce((s, r) => s + r.total, 0)} />
        <SummaryCard title="Monthly Revenue" amount={monthly.reduce((s, r) => s + r.total, 0)} />
        <SummaryCard title="Expenses" amount={expenses.reduce((s, r) => s + r.total, 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h2 className="text-lg font-medium mb-3">Revenue by Doctor</h2>
            <RevenueTable rows={byDoctor.map((b) => ({ label: b.key, amount: b.amount }))} />
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h2 className="text-lg font-medium mb-3">Revenue by Department</h2>
            <RevenueTable rows={byDept.map((b) => ({ label: b.key, amount: b.amount }))} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium mb-3">Profit & Loss</h2>
            <div className="bg-white p-4 rounded shadow-sm">
              {pnl ? (
                <div className="space-y-2">
                  <div className="flex justify-between"><div>Revenue</div><div>${pnl.revenue.toFixed(2)}</div></div>
                  <div className="flex justify-between"><div>Expenses</div><div>${pnl.expenses.toFixed(2)}</div></div>
                  <div className="flex justify-between font-semibold"><div>Profit</div><div>${pnl.profit.toFixed(2)}</div></div>
                </div>
              ) : (
                <div>No data</div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-3">Latest Daily Revenue</h2>
            <div className="bg-white p-4 rounded shadow-sm">
              <RevenueTable rows={daily.slice(-7).map(d => ({ label: d.date, amount: d.total }))} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Expense Summary</h2>
        <SimpleTable columns={["date", "total"]} rows={expenses} />
      </div>

    </div>
  );
};
