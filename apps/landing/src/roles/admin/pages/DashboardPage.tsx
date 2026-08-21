import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Car,
  Users,
  ShieldCheck,
  CheckCircle,
  Wallet,
  Wifi,
  ArrowRight,
  Route,
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse, Booking } from "@sundogo/types";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import Badge from "@/components/shared/Badge";
import { StatCardSkeleton, EmptyState, formatCurrency, timeAgo } from "@/components/shared";

interface DashboardStats {
  totalPassengers: number;
  totalDrivers: number;
  onlineDrivers: number;
  pendingVerifications: number;
  activeBookings: number;
  activeTrips: number;
  completedTrips: number;
  totalPlatformFees: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardStats>>("/api/admin/dashboard");
      return data.data!;
    },
    refetchInterval: 30_000,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["admin", "bookings", "recent"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ data: Booking[] }>>("/api/admin/bookings?limit=6");
      return data.data?.data ?? [];
    },
    refetchInterval: 30_000,
  });

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Welcome, ${user?.firstName || "Admin"}!`} description="Overview of platform activity" />
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            title="Couldn't load dashboard"
            description="There was a problem fetching platform statistics."
          />
          <div className="flex justify-center pb-8">
            <button
              onClick={() => refetch()}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.firstName || "Admin"}!`} description="Overview of platform activity" />

      {isLoading || !stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Pending verification alert */}
          {stats.pendingVerifications > 0 && (
            <button
              onClick={() => navigate("/user/admin/drivers/verification")}
              className="press flex w-full items-center gap-3 rounded-2xl border border-warning-200 bg-warning-50 p-4 text-left transition-colors hover:bg-warning-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-500/15">
                <ShieldCheck size={20} className="text-warning-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-warning-800">
                  {stats.pendingVerifications} driver{stats.pendingVerifications !== 1 ? "s" : ""} awaiting
                  verification
                </p>
                <p className="text-xs text-warning-600">Review documents to activate new drivers</p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-warning-500" />
            </button>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={ClipboardList} label="Active Bookings" value={stats.activeBookings} animated accent="info" />
            <StatCard icon={Route} label="Active Trips" value={stats.activeTrips} animated accent="purple" />
            <StatCard icon={Wifi} label="Drivers Online" value={stats.onlineDrivers} animated accent="primary" />
            <StatCard icon={ShieldCheck} label="Pending Verifications" value={stats.pendingVerifications} animated accent="warning" />
            <StatCard icon={Users} label="Registered Passengers" value={stats.totalPassengers} animated />
            <StatCard icon={Car} label="Registered Drivers" value={stats.totalDrivers} animated accent="info" />
            <StatCard icon={CheckCircle} label="Completed Trips" value={stats.completedTrips} animated accent="primary" />
            <StatCard
              icon={Wallet}
              label="Platform Fees Collected"
              value={formatCurrency(stats.totalPlatformFees)}
              accent="warning"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent bookings */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">Recent Bookings</h2>
                <button
                  onClick={() => navigate("/user/admin/bookings")}
                  className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  View all
                  <ArrowRight size={13} />
                </button>
              </div>
              {(recentBookings ?? []).length === 0 ? (
                <EmptyState
                  illustration="trips"
                  title="No bookings yet"
                  description="Bookings will appear here once passengers start riding."
                />
              ) : (
                <ul className="divide-y divide-slate-50">
                  {(recentBookings ?? []).map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => navigate(`/user/admin/bookings?focus=${b.id}`)}
                        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50/70"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {b.pickupAddress ?? "Pickup"} → {b.destinationAddress ?? "Destination"}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">{timeAgo(b.createdAt)}</p>
                        </div>
                        <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                          {formatCurrency(b.totalFare)}
                        </span>
                        <Badge label={b.status} size="sm" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="mb-4 text-base font-bold text-slate-900">Quick Actions</h2>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Review Verifications",
                    hint: `${stats.pendingVerifications} pending`,
                    path: "/user/admin/drivers/verification",
                    color: "bg-warning-50 text-warning-700 border-warning-200 hover:bg-warning-100",
                  },
                  {
                    label: "View Bookings",
                    hint: `${stats.activeBookings} active`,
                    path: "/user/admin/bookings",
                    color: "bg-info-50 text-info-700 border-info-200 hover:bg-info-100",
                  },
                  {
                    label: "Manage Fares",
                    hint: "Pricing rules",
                    path: "/user/admin/pricing",
                    color: "bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100",
                  },
                  {
                    label: "View Reports",
                    hint: "Analytics",
                    path: "/user/admin/reports",
                    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={`press flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${action.color}`}
                  >
                    <span>
                      {action.label}
                      <span className="block text-[11px] font-medium opacity-70">{action.hint}</span>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
