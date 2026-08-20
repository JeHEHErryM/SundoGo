import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { AuthLayout, LoginForm } from "@sundogo/auth";
import type { Driver, Vehicle, ApiResponse } from "@sundogo/types";

interface LoginResponse {
  token: string;
  driver: Driver;
  vehicle?: Vehicle;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await api.post<ApiResponse<LoginResponse>>("/api/auth/login", { email, password });
      if (!data.success || !data.data) throw new Error(data.error || "Login failed");
      return data.data;
    },
    onSuccess: (result) => {
      login(result.driver, result.token, result.vehicle);
      navigate("/", { replace: true });
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <AuthLayout appName="Driver">
      <LoginForm
        onSubmit={async (email, password) => {
          setError("");
          mutation.mutate({ email, password });
        }}
        isLoading={mutation.isPending}
        error={error}
        registerPath="/register"
      />
    </AuthLayout>
  );
}
