import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, LoginForm } from '@sundogo/auth';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const { role } = await login(email, password);
      const roleRedirects: Record<string, string> = {
        PASSENGER: '/user/passenger',
        DRIVER: '/user/driver',
        ADMIN: '/user/admin',
      };
      navigate(roleRedirects[role] || '/user/passenger');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={loading}
        error={error}
        registerPath="/portal"
      />
    </AuthLayout>
  );
}
