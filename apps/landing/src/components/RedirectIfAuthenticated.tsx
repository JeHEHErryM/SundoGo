import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export const DASHBOARD_PATHS: Record<string, string> = {
  PASSENGER: "/user/passenger",
  DRIVER: "/user/driver",
  ADMIN: "/user/admin",
};

export function dashboardPathFor(role?: string | null): string {
  return DASHBOARD_PATHS[role ?? ""] ?? "/user/passenger";
}

/** Renders nothing; bounces authenticated users to their dashboard. */
export default function RedirectIfAuthenticated() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(dashboardPathFor(role), { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  return null;
}
