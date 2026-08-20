import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, LoginForm } from '@sundogo/auth';
import api from '../lib/api';

const PASSENGER_APP = import.meta.env.VITE_PASSENGER_URL || 'https://passenger-alpha.vercel.app';
const DRIVER_APP = import.meta.env.VITE_DRIVER_URL || 'https://driver-five-teal.vercel.app';
const ADMIN_APP = import.meta.env.VITE_ADMIN_URL || 'https://admin-lime-rho.vercel.app';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user } = res.data;

      const roleRedirects: Record<string, string> = {
        PASSENGER: PASSENGER_APP,
        DRIVER: DRIVER_APP,
        ADMIN: ADMIN_APP,
      };

      const redirectUrl = roleRedirects[user.role] || PASSENGER_APP;
      window.location.href = redirectUrl;
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
