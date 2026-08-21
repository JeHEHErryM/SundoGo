import { useQuery } from "@tanstack/react-query";
import { Calendar, Wallet, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { Skeleton, EmptyState, formatCurrency, useCountUp } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalEarnings: number;
  history: Array<{ date: string; amount: number; trips: number }>;
}

export default function EarningsPage() {
  const { data: earnings, isLoading } = useQuery({
    queryKey: ["driver", "earnings"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<EarningsData>>("/api/payments/earnings");
      return data.data!;
    },
  });

  const animatedToday = useCountUp(earnings?.today ?? 0);
  const history = earnings?.history ?? [];
  const maxAmount = Math.max(...history.map((d) => d.amount), 1);

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 px-4 pb-14 pt-8 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-primary-300/10 blur-2xl" />

        <h1 className="relative text-xl font-bold">Earnings</h1>
        <p className="relative mt-1 text-sm text-primary-100">Track your income</p>

        <div className="relative mt-6 grid grid-cols-3 gap-3">
          <SummaryTile
            label="Today"
            isLoading={isLoading}
            value={isLoading ? null : formatCurrency(animatedToday)}
            active
          />
          <SummaryTile
            label="This Week"
            isLoading={isLoading}
            value={isLoading ? null : formatCurrency(earnings?.thisWeek ?? 0)}
          />
          <SummaryTile
            label="This Month"
            isLoading={isLoading}
            value={isLoading ? null : formatCurrency(earnings?.thisMonth ?? 0)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="safe-area-pb mx-auto -mt-6 w-full max-w-lg space-y-3 px-4 pb-6">
        <h2 className="px-1 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Last 14 Days
        </h2>

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[76px] rounded-2xl" />)
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <EmptyState
              illustration="wallet"
              title="No earnings yet"
              description="Your daily earnings will appear here after completing paid trips."
            />
          </div>
        ) : (
          <>
            {history.map((day) => (
              <div
                key={day.date}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{formatDayLabel(day.date)}</p>
                  <p className="text-xs text-slate-400">
                    {day.trips} trip{day.trips !== 1 ? "s" : ""}
                  </p>
                  {/* Relative amount bar */}
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-500"
                      style={{ width: `${Math.max((day.amount / maxAmount) * 100, 4)}%` }}
                    />
                  </div>
                </div>
                <p className="shrink-0 text-base font-bold text-slate-900">
                  {formatCurrency(day.amount)}
                </p>
              </div>
            ))}

            {earnings && earnings.totalEarnings > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4 text-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Wallet className="h-4.5 w-4.5 text-primary-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">All-time Earnings</p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <TrendingUp size={11} /> Across all completed trips
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold">{formatCurrency(earnings.totalEarnings)}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  isLoading,
  active,
}: {
  label: string;
  value: string | null;
  isLoading: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-3 text-center ${
        active ? "bg-white/20 ring-1 ring-white/30" : "bg-white/10"
      }`}
    >
      <p className="text-[11px] font-medium text-primary-100">{label}</p>
      {isLoading ? (
        <Skeleton className="mx-auto mt-1.5 h-6 w-14 !bg-white/20" />
      ) : (
        <p className={`mt-1 truncate text-sm font-bold sm:text-base ${active ? "text-white" : "text-primary-50"}`}>
          {value}
        </p>
      )}
    </div>
  );
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });
}
