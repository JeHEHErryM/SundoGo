import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { dashboardPathFor } from "./RedirectIfAuthenticated";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** When set, authenticated users with a different role are sent to their own dashboard. */
  role?: "PASSENGER" | "DRIVER" | "ADMIN";
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={dashboardPathFor(userRole)} replace />;
  }

  return <>{children}</>;
}
