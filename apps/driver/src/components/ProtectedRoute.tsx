import { useAuthStore } from "@/stores/auth.store";

const UNIFIED_LOGIN = "https://sundo-go.vercel.app/login";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    window.location.href = UNIFIED_LOGIN;
    return null;
  }

  return <>{children}</>;
}
