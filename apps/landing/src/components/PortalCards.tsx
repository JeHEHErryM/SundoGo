import { Car, User } from 'lucide-react';

const roles = [
  {
    icon: User,
    title: 'Passenger',
    description: 'Book tricycle rides around Mamburao. Quick, affordable, and reliable.',
    cta: 'Sign Up as Passenger',
    href: '/user/passenger/register',
    color: 'primary',
  },
  {
    icon: Car,
    title: 'Driver',
    description: 'Earn money by giving rides. Set your own schedule and be your own boss.',
    cta: 'Sign Up as Driver',
    href: '/user/driver/register',
    color: 'accent',
  },
];

const colorMap: Record<string, { icon: string; btn: string; hover: string }> = {
  primary: { icon: 'bg-primary-100 text-primary-600', btn: 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/25', hover: 'hover:border-primary-200' },
  accent: { icon: 'bg-accent-400/20 text-accent-600', btn: 'bg-accent-500 hover:bg-accent-600 shadow-accent-500/25', hover: 'hover:border-accent-300' },
};

export default function PortalCards() {
  return (
    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {roles.map((role) => {
        const c = colorMap[role.color];
        return (
          <div
            key={role.title}
            className={`rounded-2xl border border-slate-200 ${c.hover} p-8 flex flex-col items-center text-center transition-all hover:shadow-lg`}
          >
            <div className={`w-16 h-16 rounded-2xl ${c.icon} flex items-center justify-center mb-5`}>
              <role.icon size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{role.title}</h3>
            <p className="text-sm text-slate-500 mb-8 flex-1">{role.description}</p>
            <a
              href={role.href}
              className={`w-full h-12 ${c.btn} text-white text-sm font-semibold rounded-xl flex items-center justify-center transition-colors shadow-lg`}
            >
              {role.cta}
            </a>
          </div>
        );
      })}
    </div>
  );
}
