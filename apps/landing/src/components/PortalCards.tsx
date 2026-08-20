import { Link } from 'react-router-dom';
import { Car, User, Shield } from 'lucide-react';

const PASSENGER_APP = import.meta.env.VITE_PASSENGER_URL || 'https://passenger-alpha.vercel.app';
const DRIVER_APP = import.meta.env.VITE_DRIVER_URL || 'https://driver-five-teal.vercel.app';
const ADMIN_APP = import.meta.env.VITE_ADMIN_URL || 'https://admin-lime-rho.vercel.app';

const roles = [
  {
    icon: User,
    title: 'Passenger',
    description: 'Book tricycle rides around Mamburao. Quick, affordable, and reliable.',
    cta: 'Ride as Passenger',
    href: `${PASSENGER_APP}/register`,
    color: 'primary',
  },
  {
    icon: Car,
    title: 'Driver',
    description: 'Earn money by giving rides. Set your own schedule and be your own boss.',
    cta: 'Become a Driver',
    href: `${DRIVER_APP}/register`,
    color: 'accent',
  },
  {
    icon: Shield,
    title: 'Admin',
    description: 'Manage the SundoGo platform. Access the admin dashboard.',
    cta: 'Admin Login',
    href: `${ADMIN_APP}/login`,
    color: 'slate',
    subtle: true,
  },
];

const colorMap: Record<string, { bg: string; icon: string; btn: string; hover: string }> = {
  primary: { bg: 'bg-primary-50', icon: 'bg-primary-100 text-primary-600', btn: 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/25', hover: 'hover:border-primary-200' },
  accent: { bg: 'bg-accent-300/10', icon: 'bg-accent-400/20 text-accent-600', btn: 'bg-accent-500 hover:bg-accent-600 shadow-accent-500/25', hover: 'hover:border-accent-300' },
  slate: { bg: 'bg-slate-50', icon: 'bg-slate-200 text-slate-600', btn: 'bg-slate-700 hover:bg-slate-800 shadow-slate-700/25', hover: 'hover:border-slate-300' },
};

export default function PortalCards() {
  return (
    <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {roles.map((role) => {
        const c = colorMap[role.color];
        return (
          <div
            key={role.title}
            className={`rounded-2xl border border-slate-200 ${c.hover} p-6 flex flex-col items-center text-center transition-all hover:shadow-lg ${role.subtle ? 'opacity-80 hover:opacity-100' : ''}`}
          >
            <div className={`w-14 h-14 rounded-xl ${c.icon} flex items-center justify-center mb-4`}>
              <role.icon size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{role.title}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1">{role.description}</p>
            <a
              href={role.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full h-11 ${c.btn} text-white text-sm font-semibold rounded-xl flex items-center justify-center transition-colors shadow-lg`}
            >
              {role.cta}
            </a>
          </div>
        );
      })}
    </div>
  );
}
