import { useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Car, Clock, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/booking", icon: Car, label: "Book" },
  { to: "/history", icon: Clock, label: "History" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const location = useLocation();
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const hideNav = ["/login", "/register"].includes(location.pathname) ||
    location.pathname.startsWith("/booking/searching") ||
    location.pathname.startsWith("/booking/driver-accepted") ||
    location.pathname.startsWith("/booking/active") ||
    location.pathname.startsWith("/booking/completed") ||
    location.pathname.startsWith("/booking/payment");

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <img src="/SundoGo_Logo.svg" alt="SundoGo" className="h-9 w-auto" />
          <span className="ml-2 text-base font-bold text-slate-900">SundoGo</span>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 safe-area-pb">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
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
