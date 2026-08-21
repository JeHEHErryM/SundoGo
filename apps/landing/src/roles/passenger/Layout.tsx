import { Suspense, useEffect } from "react";
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { Home, Car, Clock, User, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

const navItems = [
  { to: "/user/passenger/", icon: Home, label: "Home" },
  { to: "/user/passenger/booking", icon: Car, label: "Book" },
  { to: "/user/passenger/history", icon: Clock, label: "History" },
  { to: "/user/passenger/notifications", icon: Bell, label: "Alerts" },
  { to: "/user/passenger/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const location = useLocation();
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const hideNav = ["/user/passenger/login", "/user/passenger/register"].includes(location.pathname) ||
    location.pathname.startsWith("/user/passenger/booking/searching") ||
    location.pathname.startsWith("/user/passenger/booking/driver-accepted") ||
    location.pathname.startsWith("/user/passenger/booking/active") ||
    location.pathname.startsWith("/user/passenger/booking/completed") ||
    location.pathname.startsWith("/user/passenger/booking/payment");

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center h-14 px-4">
          <Link to="/" className="flex items-center" aria-label="SundoGo home">
            <img src="/SundoGo_Logo.svg" alt="SundoGo" className="h-9 w-auto" />
            <span className="ml-2 text-base font-bold text-slate-900">SundoGo</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <Suspense
          fallback={
            <div className="flex min-h-[60dvh] items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 safe-area-pb">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive =
                to === "/user/passenger/"
                  ? location.pathname === "/user/passenger/"
                  : location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex flex-col items-center gap-0.5 min-w-[64px] py-1 rounded-xl transition-colors ${
                    isActive ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[11px] font-medium ${isActive ? "font-semibold" : ""}`}>
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
