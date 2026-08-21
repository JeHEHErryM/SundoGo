import { Suspense } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { Home, MapPin, Wallet, User, Bell } from "lucide-react";
import { useNotificationsStore } from "@/stores/notifications.store";
import { useOfferListener } from "./hooks/useOfferListener";

const navItems = [
  { to: "/user/driver/", icon: Home, label: "Home" },
  { to: "/user/driver/history", icon: MapPin, label: "Trips" },
  { to: "/user/driver/earnings", icon: Wallet, label: "Earnings" },
  { to: "/user/driver/notifications", icon: Bell, label: "Alerts" },
  { to: "/user/driver/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  useOfferListener();

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
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
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/user/driver/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <div className="relative">
                    <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.5} />
                    {item.label === "Alerts" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
