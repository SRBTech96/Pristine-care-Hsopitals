"use client";

import React from "react";
import Link from "next/link";
import { AuthGate } from "@/components/internal/AuthGate";
import { InternalShell } from "@/components/internal/InternalShell";
import { listLeads, LeadRecord } from "@/lib/admin-api";

export default function AdminPage() {
  return (
    <AuthGate allowedRoles={["ADMIN", "STAFF"]}>
      {(user) => <AdminDashboard user={user} />}
    </AuthGate>
  );
}

function AdminDashboard({ user }: { user: any }) {
  const [leads, setLeads] = React.useState<LeadRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listLeads();
        setLeads(data.slice(0, 8));
      } catch (err) {
        console.error(err);
        setError("Failed to load appointment requests.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const navItems = [
    { label: "Overview", href: "/admin" },
    { label: "Billing", href: "/billing" },
    { label: "Finance", href: "/finance" },
    { label: "Nurse Station", href: "/nurse-station/ward-1" },
    { label: "Doctors", href: "/doctors" },
    { label: "Appointments", href: "/appointments" },
  ];

  return (
    <InternalShell
      user={user}
      title="Admin Control Center"
      subtitle="Operational snapshot across billing, appointments, and nursing"
      navItems={navItems}
    >
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Appointment Requests", value: leads.length },
          { label: "Billing Workspace", value: "Open" },
          { label: "Finance Workspace", value: "Open" },
        ].map((card) => (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
            <p className="text-2xl font-semibold text-white mt-3">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Latest Appointment Requests</h3>
            <p className="text-xs text-slate-400">From public booking flow</p>
          </div>
          <Link href="/appointments" className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            View booking
          </Link>
        </div>

        {loading && <p className="text-sm text-slate-400 mt-4">Loading requests...</p>}
        {error && <p className="text-sm text-red-300 mt-4">{error}</p>}

        {!loading && !error && (
          <div className="mt-4 grid gap-3">
            {leads.length === 0 && (
              <p className="text-sm text-slate-400">No requests yet.</p>
            )}
            {leads.map((lead) => (
              <div key={lead.id} className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{lead.name}</p>
                    <p className="text-xs text-slate-400">{lead.phone || "No phone"} • {lead.email || "No email"}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">{lead.status}</span>
                </div>
                {lead.notes && <p className="text-xs text-slate-400 mt-2">{lead.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Billing Console", href: "/billing", description: "Invoices, payments, receipts" },
          { label: "Finance Reports", href: "/finance", description: "P&L, revenue, expenses" },
          { label: "Nurse Station", href: "/nurse-station/ward-1", description: "Ward operations" },
          { label: "Doctor Directory", href: "/doctors", description: "Specialists & availability" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
            <p className="text-sm font-semibold text-white">{item.label}</p>
            <p className="text-xs text-slate-400 mt-2">{item.description}</p>
          </Link>
        ))}
      </section>
    </InternalShell>
  );
}
