import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  MapPin,
  DollarSign,
  FileBarChart,
  LogOut,
  X,
  ShieldCheck,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", path: "/user/admin/", icon: LayoutDashboard }],
  },
  {
    title: "People",
    items: [
      { label: "Drivers", path: "/user/admin/drivers", icon: Car },
      { label: "Verification Queue", path: "/user/admin/drivers/verification", icon: ShieldCheck },
      { label: "Passengers", path: "/user/admin/passengers", icon: UserCheck },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Bookings", path: "/user/admin/bookings", icon: ClipboardList },
      { label: "Service Areas", path: "/user/admin/geography", icon: MapPin },
      { label: "Fare Management", path: "/user/admin/pricing", icon: DollarSign },
      { label: "Reports", path: "/user/admin/reports", icon: FileBarChart },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/user/admin/") return location.pathname === "/user/admin/";
    return location.pathname.startsWith(path);
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="SundoGo home">
          <img src="/SundoGo_Logo.svg" alt="SundoGo" className="h-8 w-auto" />
          <div className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">SundoGo</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-primary-400">
              Admin
            </span>
          </div>
        </Link>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon size={17} strokeWidth={active ? 2.4 : 1.8} />
                    {item.label}
                    {active && (
                      <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 z-50 w-64 shadow-xl animate-fade-in">{sidebar}</div>
        </div>
      )}
    </>
  );
}
