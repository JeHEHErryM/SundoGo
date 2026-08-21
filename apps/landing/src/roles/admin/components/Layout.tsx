import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Menu, Bell, ChevronDown, LogOut, CheckCheck } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import Avatar from "@/components/shared/Avatar";
import type { ApiResponse, Notification } from "@sundogo/types";
import { timeAgo } from "@/components/shared";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const headerRef = useRef<HTMLDivElement>(null);

  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ count: number }>>("/api/notifications/unread-count");
      return data.data?.count ?? 0;
    },
    refetchInterval: 30_000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ data: Notification[] }>>("/api/notifications?limit=6");
      return data.data?.data ?? [];
    },
    enabled: bellOpen,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.patch("/api/notifications/read-all");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setBellOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header
          ref={headerRef}
          className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="press rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen((v) => !v);
                  setMenuOpen(false);
                }}
                aria-label="Notifications"
                className="press relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <Bell size={20} />
                {(unread ?? 0) > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                    {(unread ?? 0) > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg animate-scale-in">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                    <button
                      onClick={() => markAllRead.mutate()}
                      disabled={(unread ?? 0) === 0 || markAllRead.isPending}
                      className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:text-slate-300"
                    >
                      <CheckCheck size={13} />
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
                    {(notifications ?? []).length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
                    ) : (
                      (notifications ?? []).map((n) => (
                        <div key={n.id} className={`px-4 py-3 ${!n.read ? "bg-primary-50/40" : ""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setBellOpen(false);
                }}
                className="press flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 hover:bg-slate-100"
              >
                <Avatar name={user?.name ?? "Admin"} size="sm" />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-800">{user?.name ?? "Admin"}</p>
                  <p className="text-[11px] leading-tight text-slate-400">{user?.email}</p>
                </div>
                <ChevronDown size={15} className="text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-scale-in">
                  <div className="border-b border-slate-100 px-4 py-2.5 sm:hidden">
                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                    <p className="truncate text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
