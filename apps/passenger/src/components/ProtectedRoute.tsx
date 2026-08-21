import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="https://sundo-go.vercel.app/login" replace />;
  }

  return <>{children}</>;
}
