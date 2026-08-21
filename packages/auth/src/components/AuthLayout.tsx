import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  appName?: string;
}

export function AuthLayout({ children, appName }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="max-w-sm mx-auto w-full">
          <Link to="/" className="flex items-center justify-center mb-2">
            <img src="/SundoGo_Logo.svg" alt="SundoGo" className="h-28 w-auto" />
          </Link>
          <p className="text-center text-sm font-semibold tracking-wide text-primary-600 mb-8">
            Hatid. Sundo. Anytime.
          </p>
          {appName && (
            <p className="text-center text-sm text-slate-500 mb-8">{appName}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}