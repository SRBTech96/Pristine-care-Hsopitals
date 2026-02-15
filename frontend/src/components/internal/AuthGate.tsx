"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authApi, AuthProfile } from "@/lib/auth-api";

interface AuthGateProps {
  allowedRoles: string[];
  children: (user: AuthProfile) => React.ReactNode;
}

export function AuthGate({ allowedRoles, children }: AuthGateProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await authApi.getProfile(token);
        if (!allowedRoles.includes(profile.role)) {
          router.replace("/login");
          return;
        }

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
        setUser(profile);
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-100 text-sm">Loading secure workspace...</div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children(user)}</>;
}
