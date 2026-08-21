import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { AuthLayout, DriverRegisterFlow } from "@sundogo/auth";

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
      const { data } = await api.post("/api/auth/register", {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: "DRIVER",
      });
      return data as { user: any; accessToken: string };
    },
    onSuccess: (result) => {
      login(result.user, result.accessToken);
      navigate("/verification", { replace: true });
    },
  });

  return (
    <AuthLayout appName="Driver">
      <DriverRegisterFlow
        onRegister={async (formData) => {
          await mutation.mutateAsync(formData);
        }}
      />
    </AuthLayout>
  );
}
