import { useAuthStore } from "@/stores/auth.store";
import { AuthLayout, PassengerRegisterFlow } from "@sundogo/auth";

export default function RegisterPage() {
  const register = useAuthStore((s) => s.register);

  const handleRegister = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    await register({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
  };

  return (
    <AuthLayout appName="Passenger">
      <PassengerRegisterFlow onRegister={handleRegister} />
    </AuthLayout>
  );
}
