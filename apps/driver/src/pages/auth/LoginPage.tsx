import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LogIn, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { Driver, Vehicle, ApiResponse } from "@sundogo/types";

interface LoginResponse {
  token: string;
  driver: Driver;
  vehicle?: Vehicle;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
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
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-16 pb-20 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500">
            <span className="text-xl font-bold">SG</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">SundoGo Driver</h1>
            <p className="text-sm text-slate-300">Sign in to start driving</p>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 w-full max-w-md rounded-t-3xl bg-white px-6 py-8 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">Welcome Back</h2>

        {error && (
          <div className="mb-4 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@email.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
