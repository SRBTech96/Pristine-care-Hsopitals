"use client";

import React from "react";
import Link from "next/link";
import { AuthGate } from "@/components/internal/AuthGate";
import { InternalShell } from "@/components/internal/InternalShell";
import { listLeads, listRoles, createRole, listUsers, createUser, LeadRecord, RoleRecord, UserRecord } from "@/lib/admin-api";

export default function AdminPage() {
  return (
    <AuthGate allowedRoles={["ADMIN", "STAFF"]}>
      {(user) => <AdminDashboard user={user} />}
    </AuthGate>
  );
}

function AdminDashboard({ user }: { user: any }) {
  const [leads, setLeads] = React.useState<LeadRecord[]>([]);
  const [roles, setRoles] = React.useState<RoleRecord[]>([]);
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [roleName, setRoleName] = React.useState("");
  const [roleDescription, setRoleDescription] = React.useState("");
  const [userForm, setUserForm] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roleName: "",
  });
  const [savingRole, setSavingRole] = React.useState(false);
  const [savingUser, setSavingUser] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [leadData, roleData, userData] = await Promise.all([
          listLeads(),
          listRoles(),
          listUsers(),
        ]);
        setLeads(leadData.slice(0, 8));
        setRoles(roleData);
        setUsers(userData.slice(0, 8));
      } catch (err) {
        console.error(err);
        setError("Failed to load appointment requests.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    setSavingRole(true);
    try {
      const created = await createRole({ name: roleName.trim(), description: roleDescription.trim() || undefined });
      setRoles((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setRoleName("");
      setRoleDescription("");
    } catch (err) {
      console.error(err);
      setError("Failed to create role.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email || !userForm.firstName || !userForm.lastName || !userForm.password || !userForm.roleName) {
      setError("Fill all user fields before saving.");
      return;
    }
    setSavingUser(true);
    try {
      const created = await createUser(userForm);
      setUsers((prev) => [created, ...prev].slice(0, 8));
      setUserForm({ email: "", firstName: "", lastName: "", password: "", roleName: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to create user.");
    } finally {
      setSavingUser(false);
    }
  };

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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Roles</h3>
          <p className="text-xs text-slate-400">Manage access roles for internal teams.</p>

          <form onSubmit={handleCreateRole} className="mt-4 grid grid-cols-1 gap-3">
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Role name (e.g., ADMIN)"
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            />
            <input
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              disabled={savingRole}
              className="w-full rounded-lg bg-cyan-500/90 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 transition"
            >
              {savingRole ? "Saving..." : "Add Role"}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {roles.map((role) => (
              <div key={role.id} className="border border-white/10 rounded-lg px-3 py-2">
                <p className="text-sm font-semibold text-white">{role.name}</p>
                {role.description && <p className="text-xs text-slate-400">{role.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Create User</h3>
          <p className="text-xs text-slate-400">Invite staff and assign roles.</p>

          <form onSubmit={handleCreateUser} className="mt-4 grid grid-cols-1 gap-3">
            <input
              value={userForm.email}
              onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={userForm.firstName}
                onChange={(e) => setUserForm((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="First name"
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <input
                value={userForm.lastName}
                onChange={(e) => setUserForm((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Last name"
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
            </div>
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Temporary password"
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            />
            <select
              value={userForm.roleName}
              onChange={(e) => setUserForm((prev) => ({ ...prev, roleName: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={savingUser}
              className="w-full rounded-lg bg-emerald-400/90 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-300 transition"
            >
              {savingUser ? "Saving..." : "Create User"}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {users.map((usr) => (
              <div key={usr.id} className="border border-white/10 rounded-lg px-3 py-2">
                <p className="text-sm font-semibold text-white">{usr.firstName} {usr.lastName}</p>
                <p className="text-xs text-slate-400">{usr.email} • {usr.role || "No role"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </InternalShell>
  );
}
