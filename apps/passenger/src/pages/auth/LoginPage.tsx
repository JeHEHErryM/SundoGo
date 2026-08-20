import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { AuthLayout, LoginForm } from "@sundogo/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [error, setError] = useState("");

  const handleSubmit = async (email: string, password: string) => {
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <AuthLayout appName="Passenger">
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        registerPath="/register"
      />
    </AuthLayout>
  );
}
