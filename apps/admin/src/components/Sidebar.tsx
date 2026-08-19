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

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Drivers", path: "/drivers", icon: Car },
  { label: "Verification Queue", path: "/drivers/verification", icon: ShieldCheck },
  { label: "Passengers", path: "/passengers", icon: UserCheck },
  { label: "Bookings", path: "/bookings", icon: ClipboardList },
  { label: "Service Areas", path: "/geography", icon: MapPin },
  { label: "Fare Management", path: "/pricing", icon: DollarSign },
  { label: "Reports", path: "/reports", icon: FileBarChart },
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
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const sidebar = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        <span className="text-lg font-bold tracking-tight">SundoGo Admin</span>
        <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-slate-700">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? "bg-primary-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 z-30">
        {sidebar}
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-64 z-50">{sidebar}</div>
        </div>
      )}
    </>
  );
}
