import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  data: { email: string; password: string };
  onUpdate: (data: { email: string; password: string }) => void;
}

export function PassengerRegisterStep1({ data, onUpdate }: Props) {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const passwordMismatch = confirmPassword.length > 0 && data.password !== confirmPassword;

  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
        <p className="text-sm text-slate-500 mt-1">Start riding with SundoGo</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
        <div className="relative">
          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={data.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full h-12 pl-11 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showConfirm ? 'text' : 'password'}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className={`w-full h-12 pl-11 pr-12 bg-slate-50 border rounded-xl text-sm placeholder:text-slate-400 focus:bg-white transition-colors ${
              passwordMismatch ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {passwordMismatch && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>
    </div>
  );
}