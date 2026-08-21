import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout, LoginForm } from "@sundogo/auth";
import { useAuthStore } from "@/stores/auth.store";
import api from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (email: string, password: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { user, accessToken } = res.data;
      login(user, accessToken);
      navigate("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout appName="Admin">
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={loading}
        error={error}
      />
    </AuthLayout>
  );
}
