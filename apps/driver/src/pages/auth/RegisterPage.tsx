import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { UserPlus, Loader2, Car } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { Driver, Vehicle, ApiResponse } from "@sundogo/types";

interface RegisterResponse {
  token: string;
  driver: Driver;
  vehicle?: Vehicle;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    plateNumber: "",
    vehicleModel: "",
    vehicleColor: "",
  });
  const [error, setError] = useState("");

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<RegisterResponse>>("/api/auth/register/driver", form);
      if (!data.success || !data.data) throw new Error(data.error || "Registration failed");
      return data.data;
    },
    onSuccess: (result) => {
      login(result.driver, result.token, result.vehicle);
      navigate("/verification", { replace: true });
    },
    onError: (err: Error) => setError(err.message),
  });

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:bg-white";

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-12 pb-16 text-white">
        <h1 className="text-2xl font-bold">Driver Registration</h1>
        <p className="mt-1 text-sm text-slate-300">Create your driver account</p>
      </div>

      <div className="mx-auto -mt-8 w-full max-w-md rounded-t-3xl bg-white px-6 py-8 shadow-lg">
        {error && (
          <div className="mb-4 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">{error}</div>
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
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
              <UserPlus className="h-4 w-4" /> Personal Info
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input type="text" required placeholder="First name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputCls} />
                <input type="text" required placeholder="Last name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputCls} />
              </div>
              <input type="email" required placeholder="Email address" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
              <input type="tel" required placeholder="Phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
              <input type="password" required placeholder="Password (min. 8 chars)" value={form.password} onChange={(e) => update("password", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
              <Car className="h-4 w-4" /> Vehicle Info
            </h3>
            <div className="space-y-3">
              <input type="text" required placeholder="Plate number" value={form.plateNumber} onChange={(e) => update("plateNumber", e.target.value)} className={inputCls} />
              <input type="text" required placeholder="Vehicle model (e.g., Honda Wave)" value={form.vehicleModel} onChange={(e) => update("vehicleModel", e.target.value)} className={inputCls} />
              <input type="text" required placeholder="Vehicle color" value={form.vehicleColor} onChange={(e) => update("vehicleColor", e.target.value)} className={inputCls} />
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60"
          >
            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
