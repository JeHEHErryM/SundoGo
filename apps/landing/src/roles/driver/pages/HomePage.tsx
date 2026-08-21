import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CircleDot, Navigation, Clock, TrendingUp, Wallet, ChevronRight, Star, Sun, Moon, Sunset } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useDriverStore } from "@/stores/driver.store";
import { Skeleton, formatCurrency } from "@/components/shared";
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

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pb-8 pt-10 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-slate-300">
              {getTimeIcon()} Good {getTimeOfDay()},
            </p>
            <h1 className="mt-0.5 text-xl font-bold">Welcome, {user?.firstName || "Driver"}!</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-base font-bold">
            {(user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")}
          </div>
        </div>

        {/* Online Toggle */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <CircleDot className={`h-5 w-5 ${isOnline ? "text-success-400" : "text-gray-400"}`} />
            <div>
              <p className="text-sm font-semibold">{isOnline ? "You're Online" : "You're Offline"}</p>
              <p className="text-xs text-slate-300">
                {isOnline ? "Ready to accept bookings" : "Go online to receive bookings"}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleOnline.mutate()}
            disabled={toggleOnline.isPending}
            className={`toggle-switch ${isOnline ? "!bg-success-500" : "!bg-gray-600"} !w-16`}
            role="switch"
            aria-checked={isOnline}
            aria-label="Toggle online status"
          >
            <span className={`toggle-dot ${isOnline ? "translate-x-7" : ""}`} />
          </button>
        </div>
      </div>

      <div className="safe-area-pb mx-auto -mt-4 max-w-lg space-y-4 px-4 pb-6">
        {/* Active Booking */}
        {currentBooking && (
          <button
            onClick={() => navigate("/user/driver/booking/navigate")}
            className="press w-full rounded-2xl border-2 border-primary-200 bg-primary-50 p-4 text-left shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-800">Active Booking</p>
                  <p className="text-xs text-primary-600">
                    {currentBooking.pickupAddress ?? "Navigate to pickup"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary-400" />
            </div>
          </button>
        )}

        {/* Today's Earnings */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Wallet className="h-4 w-4" /> Today's Earnings
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-9 w-36 rounded-lg" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-success-600">{formatCurrency(earnings)}</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Clock className="h-5 w-5 text-primary-500" />}
            label="Trips Today"
            value={isLoading ? null : String(dashboard?.todayTrips ?? 0)}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-success-500" />}
            label="Total Earnings"
            value={isLoading ? null : formatCurrency(dashboard?.totalEarnings ?? 0)}
          />
        </div>

        {/* Rating */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your Rating</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">
              {dashboard?.averageRating != null ? dashboard.averageRating.toFixed(1) : "—"}
            </span>
            {dashboard?.averageRating != null && (
              <span className="flex items-center gap-1 text-sm text-gray-400">
                / 5.0 <Star size={13} className="fill-amber-400 text-amber-400" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      {value === null ? (
        <Skeleton className="mt-2.5 h-6 w-20 rounded-md" />
      ) : (
        <p className="mt-2 text-xl font-bold text-gray-800">{value}</p>
      )}
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
  return <Icon size={14} className="text-slate-300" />;
}
