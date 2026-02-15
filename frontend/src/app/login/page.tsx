"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth-api";
import { AlertCircle, Loader } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("authToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      document.cookie = `authToken=${encodeURIComponent(res.accessToken)}; path=/; max-age=86400; SameSite=Lax`;

      const profile = await authApi.getProfile(res.accessToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          roles: [profile.role],
        })
      );

      if (profile.role === "OWNER") {
        router.push("/owner");
      } else if (profile.role === "DOCTOR") {
        router.push("/doctor");
      } else if (profile.role === "ADMIN" || profile.role === "STAFF") {
        router.push("/admin");
      } else if (profile.role === "FINANCE") {
        router.push("/finance");
      } else if (profile.role === "CASHIER") {
        router.push("/billing");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Internal Portal</p>
            <h1 className="text-4xl font-semibold mt-4">Pristine Ops Access</h1>
            <p className="text-slate-300 mt-4 max-w-md">
              Manage appointments, clinical operations, and owner insights from a single secure workspace.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Admin</p>
                <p className="mt-2">Operations, CRM, billing, staffing.</p>
              </div>
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Doctor</p>
                <p className="mt-2">Schedule, appointments, patient follow-up.</p>
              </div>
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Owner</p>
                <p className="mt-2">Revenue, expenses, strategic metrics.</p>
              </div>
              <div className="border border-white/10 rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Finance</p>
                <p className="mt-2">Cashflow, billing, P&L exports.</p>
              </div>
            </div>
          </div>

          <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="text-sm text-slate-500 mt-2">Use your staff credentials to continue.</p>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="you@pristinehospital.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white rounded-lg py-3 font-semibold hover:bg-slate-800 transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
