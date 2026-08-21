import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Navigation, Clock, TrendingUp, Wallet, ChevronRight, Star,
  Sun, Moon, Sunset, Bike, Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useDriverStore } from "@/stores/driver.store";
import { Skeleton, formatCurrency, useCountUp } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";

interface DashboardData {
  todayTrips: number;
  todayEarnings: number;
  totalEarnings: number;
  averageRating: number | null;
  isOnline: boolean;
}

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { isOnline, currentBooking, goOnline, goOffline } = useDriverStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["driver", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardData>>("/api/drivers/dashboard");
      return data.data!;
    },
    refetchInterval: 15000,
  });

  // Keep store in sync with server state.
  useEffect(() => {
    if (dashboard && dashboard.isOnline !== isOnline) {
      if (dashboard.isOnline) goOnline();
      else goOffline();
    }
  }, [dashboard, isOnline, goOnline, goOffline]);

  const toggleOnline = useMutation({
    mutationFn: async () => {
      await api.patch("/api/drivers/availability", {
        status: isOnline ? "OFFLINE" : "ONLINE",
      });
    },
    onSuccess: () => (isOnline ? goOffline() : goOnline()),
    onError: () => {
      /* revert silently; next poll re-syncs */
    },
  });

  const earnings = dashboard?.todayEarnings ?? 0;
  const animatedEarnings = useCountUp(earnings);

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 px-4 pb-10 pt-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-primary-300/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-primary-100">
              {getTimeIcon()} Good {getTimeOfDay()},
            </p>
            <h1 className="mt-0.5 text-xl font-bold">Welcome, {user?.firstName || "Driver"}!</h1>
          </div>
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-base font-bold backdrop-blur-sm">
              {(user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary-800 ${
                isOnline ? "bg-success-400" : "bg-slate-400"
              }`}
            />
          </div>
        </div>

        {/* Online status line */}
        <p className="relative mt-4 flex items-center gap-2 text-sm text-primary-100">
          <span className="relative flex h-2 w-2">
            {isOnline && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isOnline ? "bg-success-400" : "bg-slate-400"
              }`}
            />
          </span>
          {isOnline ? "You're online — ready to accept bookings" : "You're offline"}
        </p>
      </div>

      {/* Content */}
      <div className="safe-area-pb relative -mt-4 space-y-4 px-4 pb-6">
        {/* Active booking banner */}
        {currentBooking && (
          <button
            onClick={() => navigate("/user/driver/booking/navigate")}
            className="press flex w-full items-center gap-3 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-left shadow-lg shadow-primary-600/25"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Navigation size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Active Booking</p>
              <p className="truncate text-xs text-primary-100">
                {currentBooking.pickupAddress ?? "Navigate to pickup"}
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-primary-100" />
          </button>
        )}

        {/* Availability toggle */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/60">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              isOnline ? "bg-success-50" : "bg-slate-100"
            }`}
          >
            <Bike size={18} className={isOnline ? "text-success-600" : "text-slate-400"} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {isOnline ? "You're Online" : "You're Offline"}
            </p>
            <p className="text-xs text-slate-400">
              {isOnline ? "Accepting new booking requests" : "Go online to receive bookings"}
            </p>
          </div>
          <button
            onClick={() => toggleOnline.mutate()}
            disabled={toggleOnline.isPending}
            className={`toggle-switch ${isOnline ? "!bg-success-500" : "!bg-slate-300"} !w-16`}
            role="switch"
            aria-checked={isOnline}
            aria-label="Toggle online status"
          >
            <span className={`toggle-dot ${isOnline ? "translate-x-7" : ""}`} />
          </button>
        </div>

        {/* Today's earnings hero */}
        <button
          onClick={() => navigate("/user/driver/earnings")}
          className="press block w-full rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Wallet size={14} /> Today's Earnings
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-9 w-40 rounded-lg" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatCurrency(animatedEarnings)}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">Tap to view your full earnings breakdown</p>
        </button>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            icon={<Clock size={16} />}
            label="Trips Today"
            isLoading={isLoading}
            value={String(dashboard?.todayTrips ?? 0)}
            iconClass="bg-primary-50 text-primary-600"
          />
          <StatTile
            icon={<TrendingUp size={16} />}
            label="All-Time"
            isLoading={isLoading}
            value={formatCurrency(dashboard?.totalEarnings ?? 0)}
            iconClass="bg-emerald-50 text-emerald-600"
          />
          <StatTile
            icon={<Star size={16} />}
            label="Rating"
            isLoading={isLoading}
            value={
              dashboard?.averageRating != null
                ? dashboard.averageRating.toFixed(1)
                : "—"
            }
            iconClass="bg-amber-50 text-amber-500"
          />
        </div>

        {/* Tip card */}
        {!isOnline && !currentBooking && (
          <div className="flex items-center gap-3 rounded-2xl bg-primary-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100">
              <Sparkles size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-900">Ready to earn?</p>
              <p className="text-xs text-primary-600/70">
                Go online to start receiving booking requests nearby.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  isLoading,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLoading: boolean;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
        {icon}
      </div>
      {isLoading ? (
        <Skeleton className="mt-2.5 h-5 w-14 rounded-md" />
      ) : (
        <p className="mt-2 truncate text-base font-bold text-slate-900">{value}</p>
      )}
      <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">{label}</p>
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function getTimeIcon() {
  const h = new Date().getHours();
  const Icon = h < 12 ? Sun : h < 17 ? Sunset : Moon;
  return <Icon size={14} className="text-primary-200" />;
}
