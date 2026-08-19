import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CircleDot, Navigation, Clock, TrendingUp, Wallet, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useDriverStore } from "@/stores/driver.store";
import type { ApiResponse } from "@sundogo/types";

interface DashboardData {
  todayTrips: number;
  todayEarnings: number;
  totalEarnings: number;
  averageRating: number;
  isOnline: boolean;
}

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { isOnline, currentBooking, goOnline, goOffline } = useDriverStore();

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardData>>("/api/driver/dashboard");
      return data.data!;
    },
    refetchInterval: 10000,
  });

  const toggleOnline = async () => {
    try {
      if (isOnline) {
        await api.post("/api/driver/offline");
        goOffline();
      } else {
        await api.post("/api/driver/online");
        goOnline();
      }
    } catch {
      // handle silently
    }
  };

  const earnings = dashboard?.todayEarnings ?? 0;

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pt-12 pb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Good {getTimeOfDay()},</p>
            <h1 className="text-xl font-bold">{user?.firstName ?? "Driver"} 👋</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </div>

        {/* Online Toggle */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 backdrop-blur-sm px-5 py-4">
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
            onClick={toggleOnline}
            className={`toggle-switch ${isOnline ? "bg-success-500" : "bg-gray-600"}`}
            aria-label="Toggle online status"
          >
            <span className={`toggle-dot ${isOnline ? "translate-x-[56px]" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-lg -mt-4 space-y-4 px-4 pb-6">
        {/* Active Booking */}
        {currentBooking && (
          <button
            onClick={() => navigate("/booking/navigate")}
            className="w-full rounded-2xl border-2 border-primary-200 bg-primary-50 p-4 text-left shadow-sm transition-all active:scale-[0.98]"
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
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            <Wallet className="h-4 w-4" /> Today's Earnings
          </div>
          <p className="mt-2 text-3xl font-bold text-success-600">
            ₱{earnings.toFixed(2)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Clock className="h-5 w-5 text-primary-500" />} label="Trips Today" value={dashboard?.todayTrips ?? 0} />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-success-500" />} label="Total Earnings" value={`₱${(dashboard?.totalEarnings ?? 0).toFixed(0)}`} />
        </div>

        {/* Rating */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Your Rating</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">{dashboard?.averageRating?.toFixed(1) ?? "N/A"}</span>
            {dashboard?.averageRating && <span className="text-sm text-gray-400">/ 5.0 ⭐</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}
