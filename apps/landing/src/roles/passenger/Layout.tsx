import { Suspense, useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { Home, Car, Clock, User, Bell, PanelBottom } from "lucide-react";
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
  const [navigationMode, setNavigationMode] = useState<"visible" | "translucent" | "hidden">(
    () => (localStorage.getItem("sundogo_navigation_mode") as "visible" | "translucent" | "hidden") || "visible",
  );

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const syncNavigationMode = () => {
      const mode = localStorage.getItem("sundogo_navigation_mode");
      if (mode === "visible" || mode === "translucent" || mode === "hidden") setNavigationMode(mode);
    };
    window.addEventListener("sundogo-navigation-mode", syncNavigationMode);
    window.addEventListener("storage", syncNavigationMode);
    return () => {
      window.removeEventListener("sundogo-navigation-mode", syncNavigationMode);
      window.removeEventListener("storage", syncNavigationMode);
    };
  }, []);

  const hideNav = ["/user/passenger/login", "/user/passenger/register"].includes(location.pathname) ||
    location.pathname.startsWith("/user/passenger/booking/searching") ||
    location.pathname.startsWith("/user/passenger/booking/driver-accepted") ||
    location.pathname.startsWith("/user/passenger/booking/active") ||
    location.pathname.startsWith("/user/passenger/booking/completed") ||
    location.pathname.startsWith("/user/passenger/booking/payment");

  const cycleNavigationMode = () => {
    const next = navigationMode === "visible" ? "translucent" : navigationMode === "translucent" ? "hidden" : "visible";
    setNavigationMode(next);
    localStorage.setItem("sundogo_navigation_mode", next);
    window.dispatchEvent(new Event("sundogo-navigation-mode"));
  };

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center h-14 px-4">
          <Link to="/" className="flex items-center" aria-label="SundoGo home">
            <img src="/SundoGo_Logo.svg" alt="SundoGo" className="h-9 w-auto" />
            <span className="ml-2 hidden text-base font-bold text-slate-900 sm:inline">SundoGo</span>
          </Link>
          <button
            onClick={cycleNavigationMode}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:w-auto sm:gap-2 sm:rounded-lg sm:px-3"
            aria-label="Toggle bottom navigation"
            title={`Bottom navigation: ${navigationMode}`}
          >
            <PanelBottom size={17} />
            <span className="hidden text-xs font-semibold capitalize sm:inline">{navigationMode}</span>
          </button>
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

      {!hideNav && navigationMode !== "hidden" && (
        <nav className={`fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 safe-area-pb ${
          navigationMode === "translucent"
            ? "bg-white/65 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-white/50"
            : "bg-white"
        }`}>
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
