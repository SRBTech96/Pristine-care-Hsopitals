"use client";

import React from "react";
import { AuthGate } from "@/components/internal/AuthGate";
import { InternalShell } from "@/components/internal/InternalShell";
import {
  getDailyRevenue,
  getMonthlyRevenue,
  getRevenueByDoctor,
  getRevenueByDepartment,
  getExpensesSummary,
  getPharmacyRevenue,
  getDiscountsSummary,
} from "@/lib/owner-api";
import { SummaryCard } from "@/components/finance/SummaryCard";
import { RevenueTable, SimpleTable } from "@/components/finance/Tables";

export default function OwnerPage() {
  return (
    <AuthGate allowedRoles={["OWNER"]}>
      {(user) => <OwnerDashboard user={user} />}
    </AuthGate>
  );
}

function OwnerDashboard({ user }: { user: any }) {
  const [daily, setDaily] = React.useState<{ date: string; total: number } | null>(null);
  const [monthly, setMonthly] = React.useState<{ month: string; total: number } | null>(null);
  const [pharmacy, setPharmacy] = React.useState<{ total: number } | null>(null);
  const [discounts, setDiscounts] = React.useState<any>(null);
  const [expenses, setExpenses] = React.useState<any>(null);
  const [byDoctor, setByDoctor] = React.useState<any[]>([]);
  const [byDept, setByDept] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [d, m, p, dis, exp, bd, bdept] = await Promise.all([
          getDailyRevenue(),
          getMonthlyRevenue(),
          getPharmacyRevenue(),
          getDiscountsSummary(),
          getExpensesSummary(),
          getRevenueByDoctor(),
          getRevenueByDepartment(),
        ]);
        setDaily(d);
        setMonthly(m);
        setPharmacy(p);
        setDiscounts(dis);
        setExpenses(exp);
        setByDoctor(bd);
        setByDept(bdept);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const navItems = [
    { label: "Overview", href: "/owner" },
    { label: "Finance", href: "/finance" },
  ];

  return (
    <InternalShell
      user={user}
      title="Owner Dashboard"
      subtitle="Strategic financial view across hospital operations"
      navItems={navItems}
    >
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Daily Revenue" amount={daily?.total || 0} subtitle={daily?.date} />
        <SummaryCard title="Monthly Revenue" amount={monthly?.total || 0} subtitle={monthly?.month} />
        <SummaryCard title="Pharmacy Revenue" amount={pharmacy?.total || 0} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Discounts Total" amount={discounts?.totalDiscount || 0} />
        <SummaryCard title="Expenses Total" amount={expenses?.total || 0} />
        <SummaryCard title="Net Impact" amount={(daily?.total || 0) - (expenses?.total || 0)} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Revenue by Doctor</h3>
          {loading ? (
            <p className="text-sm text-slate-400 mt-4">Loading...</p>
          ) : (
            <RevenueTable rows={(byDoctor || []).map((row) => ({ label: row.doctorId, amount: Number(row.total || 0) }))} />
          )}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Revenue by Department</h3>
          {loading ? (
            <p className="text-sm text-slate-400 mt-4">Loading...</p>
          ) : (
            <RevenueTable rows={(byDept || []).map((row) => ({ label: row.departmentId, amount: Number(row.total || 0) }))} />
          )}
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold">Expense Categories</h3>
        {loading ? (
          <p className="text-sm text-slate-400 mt-4">Loading...</p>
        ) : (
          <SimpleTable columns={["category", "total"]} rows={expenses?.perCategory || []} />
        )}
      </section>
    </InternalShell>
  );
}
