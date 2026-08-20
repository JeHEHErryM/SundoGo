import { Car } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  onConfirm: () => void;
}

export function DriverRegisterStep1({ onConfirm }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Join SundoGo as a Driver</h2>
        <p className="text-sm text-slate-500 mt-1">
          Earn money by giving rides in your tricycle
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-slate-900">What you'll need:</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">1</div>
            Valid government ID
          </li>
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">2</div>
            Driver's license
          </li>
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">3</div>
            OR/CR of your tricycle
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/25"
      >
        <Car size={18} />
        Yes, I'm a Driver
      </button>

      <p className="text-center text-sm text-slate-500">
        Not a driver?{' '}
        <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
          Register as Passenger
        </Link>
      </p>
    </div>
  );
}