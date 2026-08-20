import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { AuthLayout, DriverRegisterFlow } from "@sundogo/auth";
import type { Driver, Vehicle, ApiResponse } from "@sundogo/types";

interface RegisterResponse {
  token: string;
  driver: Driver;
  vehicle: Vehicle;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const mutation = useMutation({
    mutationFn: async (formData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      plateNumber: string;
      vehicleModel: string;
      vehicleColor: string;
    }) => {
      const { data } = await api.post<ApiResponse<RegisterResponse>>("/api/auth/register/driver", formData);
      if (!data.success || !data.data) throw new Error(data.error || "Registration failed");
      return data.data;
    },
    onSuccess: (result) => {
      login(result.driver, result.token, result.vehicle);
      navigate("/verification", { replace: true });
    },
  });

  return (
    <AuthLayout appName="Driver">
      <DriverRegisterFlow
        onRegister={async (formData) => {
          mutation.mutateAsync(formData);
        }}
      />
    </AuthLayout>
  );
}
