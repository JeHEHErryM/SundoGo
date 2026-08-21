import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { AuthLayout, LoginForm } from "@sundogo/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await api.post("/api/auth/login", { email, password });
      return data as { user: any; accessToken: string };
    },
    onSuccess: (result) => {
      login(result.user, result.accessToken);
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
