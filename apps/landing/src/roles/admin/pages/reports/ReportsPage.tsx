import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Star, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";
import PageHeader from "@/components/shared/PageHeader";
import SegmentedControl from "@/components/shared/SegmentedControl";
import { Skeleton } from "@/components/shared/Skeleton";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { formatCurrency } from "@/components/shared";
import { AreaChart, ColumnChart, DonutChart } from "../../components/charts";

interface ReportData {
  days: number;
  totals: { trips: number; revenue: number };
  tripsPerDay: { date: string; trips: number; revenue: number }[];
  topDrivers: { id: string; name: string; trips: number; rating: number | null }[];
  demandByArea: { id: string; name: string; enabled: boolean; bookings: number }[];
}

const RANGE_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
];

function dayLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState("7");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "reports", days],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ReportData>>(`/api/admin/reports?days=${days}`);
      return data.data!;
    },
  });

  const labels = (data?.tripsPerDay ?? []).map((d) => dayLabel(d.date));
  const hasTrips = (data?.totals.trips ?? 0) > 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Platform analytics and performance insights" />

      <SegmentedControl options={RANGE_OPTIONS} value={days} onChange={setDays} />

      {isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <ErrorState message="Could not load reports." onRetry={() => refetch()} />
        </div>
      ) : isLoading || !data ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex w-fit rounded-lg bg-primary-50 p-2.5">
                <CheckCircle2 size={18} className="text-primary-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{data.totals.trips.toLocaleString()}</p>
              <p className="mt-0.5 text-sm text-slate-500">Completed Trips ({data.days}d)</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex w-fit rounded-lg bg-primary-50 p-2.5">
                <TrendingUp size={18} className="text-primary-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{formatCurrency(data.totals.revenue)}</p>
              <p className="mt-0.5 text-sm text-slate-500">Paid Revenue ({data.days}d)</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex w-fit rounded-lg bg-primary-50 p-2.5">
                <MapPin size={18} className="text-primary-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {data.demandByArea.filter((a) => a.enabled).length}
                <span className="text-base font-semibold text-slate-400"> / {data.demandByArea.length}</span>
              </p>
              <p className="mt-0.5 text-sm text-slate-500">Active Service Areas</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h2 className="mb-5 text-base font-bold text-slate-900">Trip Volume</h2>
              {hasTrips ? (
                <AreaChart
                  labels={labels}
                  values={data.tripsPerDay.map((d) => d.trips)}
                  height={240}
                />
              ) : (
                <EmptyState
                  illustration="trips"
                  title="No completed trips"
                  description={`No trips were completed in the last ${data.days} days.`}
                />
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h2 className="mb-5 text-base font-bold text-slate-900">Daily Fare Revenue (₱)</h2>
              {hasTrips ? (
                <ColumnChart
                  labels={labels}
                  values={data.tripsPerDay.map((d) => d.revenue)}
                  height={240}
                />
              ) : (
                <EmptyState
                  illustration="wallet"
                  title="No revenue yet"
                  description="Revenue appears once trips are completed and paid."
                />
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Top drivers */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h2 className="mb-4 text-base font-bold text-slate-900">Top Drivers</h2>
              {data.topDrivers.length === 0 ? (
                <EmptyState
                  illustration="trips"
                  title="No driver activity"
                  description="Top drivers appear once trips are completed."
                />
              ) : (
                <ol className="space-y-2.5">
                  {data.topDrivers.map((driver, i) => (
                    <li key={driver.id}>
                      <button
                        onClick={() => navigate(`/user/admin/drivers/${driver.id}`)}
                        className="press flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3.5 text-left transition-colors hover:bg-primary-50"
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            i === 0 ? "bg-primary-600 text-white" : "bg-primary-100 text-primary-700"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                          {driver.name}
                        </span>
                        <span className="shrink-0 text-xs text-slate-500">{driver.trips} trips</span>
                        {driver.rating !== null && (
                          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-600">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            {driver.rating.toFixed(1)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Demand by area */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h2 className="mb-4 text-base font-bold text-slate-900">Demand by Service Area</h2>
              {data.demandByArea.every((a) => a.bookings === 0) ? (
                <EmptyState
                  illustration="search"
                  title="No booking activity"
                  description="Bookings per area will show up as passengers request rides."
                />
              ) : (
                <DonutChart
                  labels={data.demandByArea.filter((a) => a.bookings > 0).map((a) => a.name)}
                  values={data.demandByArea.filter((a) => a.bookings > 0).map((a) => a.bookings)}
                  height={260}
                />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
