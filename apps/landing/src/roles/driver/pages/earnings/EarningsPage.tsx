import { useQuery } from "@tanstack/react-query";
import { Calendar, Wallet } from "lucide-react";
import api from "@/lib/api";
import { Skeleton, EmptyState, formatCurrency } from "@/components/shared";
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

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-success-600 to-success-800 px-5 pb-16 pt-10 text-white">
        <h1 className="text-xl font-bold">Earnings</h1>
        <p className="mt-1 text-sm text-success-100">Track your income</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <EarningsCard label="Today" value={isLoading ? null : (earnings?.today ?? null)} active />
          <EarningsCard label="This Week" value={isLoading ? null : (earnings?.thisWeek ?? null)} />
          <EarningsCard label="This Month" value={isLoading ? null : (earnings?.thisMonth ?? null)} />
        </div>
      </div>

      <div className="safe-area-pb mx-auto -mt-6 w-full max-w-lg space-y-3 px-4 pb-6">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Last 14 Days
        </h2>

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-2xl" />)
        ) : (earnings?.history ?? []).length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm">
            <EmptyState
              illustration="wallet"
              title="No earnings yet"
              description="Your daily earnings will appear here after completing paid trips."
            />
          </div>
        ) : (
          <>
            {(earnings?.history ?? []).map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{formatDate(day.date)}</p>
                    <p className="text-xs text-gray-400">
                      {day.trips} trip{day.trips !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-success-600">{formatCurrency(day.amount)}</p>
              </div>
            ))}
            {earnings && earnings.totalEarnings > 0 && (
              <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-sm">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-success-400" />
                  <p className="text-sm font-semibold">All-time Earnings</p>
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

function EarningsCard({ label, value, active }: { label: string; value: number | null; active?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${active ? "bg-white/20" : "bg-white/10"}`}>
      <p className="text-[11px] text-success-200">{label}</p>
      {value === null ? (
        <Skeleton className="mx-auto mt-1.5 h-6 w-14 !bg-white/20" />
      ) : (
        <p className={`mt-1 text-base font-bold sm:text-lg ${active ? "text-white" : "text-success-100"}`}>
          {formatCurrency(value)}
        </p>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
