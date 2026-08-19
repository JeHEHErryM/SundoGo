import { useQuery } from "@tanstack/react-query";
import { Wallet, Calendar } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  history: Array<{ date: string; amount: number; trips: number }>;
}

export default function EarningsPage() {
  const { data: earnings } = useQuery({
    queryKey: ["earnings"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<EarningsData>>("/api/driver/earnings");
      return data.data!;
    },
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-success-600 to-success-800 px-5 pt-12 pb-16 text-white">
        <h1 className="text-xl font-bold">Earnings</h1>
        <p className="mt-1 text-sm text-success-100">Track your income</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <EarningsCard label="Today" value={`₱${(earnings?.today ?? 0).toFixed(0)}`} active />
          <EarningsCard label="This Week" value={`₱${(earnings?.thisWeek ?? 0).toFixed(0)}`} />
          <EarningsCard label="This Month" value={`₱${(earnings?.thisMonth ?? 0).toFixed(0)}`} />
        </div>
      </div>

      <div className="mx-auto -mt-6 w-full max-w-lg space-y-3 px-4 pb-6">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-gray-400">Earnings History</h2>
        {(earnings?.history ?? []).length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Wallet className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">No earnings yet. Start driving!</p>
          </div>
        ) : (
          (earnings?.history ?? []).map((day, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{formatDate(day.date)}</p>
                  <p className="text-xs text-gray-400">{day.trips} trip{day.trips !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-success-600">₱{day.amount.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EarningsCard({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${active ? "bg-white/20" : "bg-white/10"}`}>
      <p className="text-[11px] text-success-200">{label}</p>
      <p className={`mt-1 text-lg font-bold ${active ? "text-white" : "text-success-100"}`}>{value}</p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
