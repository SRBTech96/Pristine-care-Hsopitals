"use client";

import React from "react";
import Link from "next/link";
import { authApi, AuthProfile } from "@/lib/auth-api";

interface NavItem {
  label: string;
  href: string;
}

interface InternalShellProps {
  user: AuthProfile;
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function InternalShell({ user, title, subtitle, navItems, children }: InternalShellProps) {
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      document.cookie = "authToken=; path=/; max-age=0";
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-screen">
        <aside className="border-r border-white/10 bg-slate-950/70 backdrop-blur">
          <div className="px-6 py-6">
            <div className="text-lg font-semibold tracking-wide">Pristine Ops</div>
            <div className="text-xs text-slate-400 mt-1">Secure internal workspace</div>
          </div>

          <nav className="px-4 py-2 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition"
              >
                <span>{item.label}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              </Link>
            ))}
          </nav>
        </aside>

        <main className="px-6 py-8 lg:px-10">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Internal</p>
              <h1 className="text-3xl font-semibold text-white mt-2">{title}</h1>
              {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-widest border border-white/10 rounded-full hover:bg-white/10 transition"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </header>

          <section className="mt-8 space-y-6">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
