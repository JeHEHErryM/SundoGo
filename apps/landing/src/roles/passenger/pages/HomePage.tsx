import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, Shield, ChevronRight, MapPin, History } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Skeleton, EmptyState, formatDateTime, formatCurrency, fullName } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";
import type { BookingStatus } from "@sundogo/types";

interface RecentBooking {
  id: string;
  status: BookingStatus;
  destinationAddress: string;
  pickupAddress: string;
  totalFare: string;
  createdAt: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: recents, isLoading } = useQuery({
    queryKey: ["passenger", "recent-bookings"],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ data: (RecentBooking & { driver?: { firstName: string; lastName: string } | null })[] }>
      >("/api/bookings?page=1&limit=3");
      return data.data?.data ?? [];
    },
  });

  return (
    <div className="min-h-dvh bg-slate-50">
        {/* Greeting */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-4 pb-10 pt-6 text-white">
          <p className="text-sm text-primary-100">Welcome back,</p>
          <h1 className="mt-0.5 text-xl font-bold">{user?.firstName || "Rider"}!</h1>
          <p className="mt-1 text-sm text-primary-100">Where would you like to go today?</p>
        </div>

      {/* Content */}
      <div className="safe-area-pb relative -mt-4 space-y-4 px-4 pb-6">
        {/* Search bar */}
        <button
          onClick={() => navigate("/user/passenger/booking")}
          className="press flex h-14 w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 text-left shadow-lg shadow-slate-200/60 transition-shadow hover:shadow-xl"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600">
            <Search size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Where to?</p>
            <p className="text-xs text-slate-400">Set your pickup and destination</p>
          </div>
        </button>

        {/* Recent bookings */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Recent Rides</h3>
            </div>
            <button
              onClick={() => navigate("/user/passenger/history")}
              className="text-xs font-medium text-primary-600"
            >
              See all
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2 px-4 pb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (recents ?? []).length === 0 ? (
            <div className="px-2 pb-2">
              <EmptyState
                illustration="trips"
                title="No rides yet"
                description="Your recent rides will appear here after your first trip."
              />
            </div>
          ) : (
            (recents ?? []).map((booking, i, arr) => (
              <button
                key={booking.id}
                onClick={() => navigate("/user/passenger/history")}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                  i < arr.length - 1 ? "border-b border-slate-50" : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                  <MapPin size={16} className="text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {booking.destinationAddress}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {formatDateTime(booking.createdAt)}
                    {booking.driver ? ` · with ${fullName(booking.driver)}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-700">
                  {formatCurrency(booking.totalFare)}
                </span>
                <ChevronRight size={16} className="shrink-0 text-slate-300" />
              </button>
            ))
          )}
        </div>

        {/* Safety info */}
        <div className="flex items-center gap-3 rounded-2xl bg-primary-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100">
            <Shield size={18} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-900">Your safety matters</p>
            <p className="text-xs text-primary-600/70">All trips are tracked and drivers are verified</p>
          </div>
        </div>

        {/* How it works */}
        <button
          onClick={() => navigate("/user/passenger/booking")}
          className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <History size={18} className="text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">First time riding?</p>
            <p className="text-xs text-slate-400">Booking takes less than a minute</p>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
        </button>
      </div>
    </div>
  );
}
