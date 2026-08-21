import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { AuthLayout, DriverRegisterFlow } from "@sundogo/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const handleRegister = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    plateNumber: string;
    vehicleModel: string;
    vehicleColor: string;
  }) => {
    await register({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: "DRIVER",
    });
    navigate("/user/driver/verification", { replace: true });
  };

  return (
    <AuthLayout appName="Driver">
      <DriverRegisterFlow onRegister={handleRegister} />
    </AuthLayout>
  );
}
