import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MapPin, Navigation, Clock, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { Skeleton, EmptyState, ErrorState, Badge, formatCurrency, formatDateTime, fullName } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";
import type { BookingStatus, TripStatus } from "@sundogo/types";

interface TripHistoryItem {
  id: string;
  status: TripStatus;
  createdAt: string;
  completedAt: string | null;
  passenger: { firstName: string; lastName: string; phone: string };
  booking: {
    id: string;
    status: BookingStatus;
    pickupAddress: string;
    destinationAddress: string;
    totalFare: string;
  };
}

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function TripHistoryPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["driver", "trips", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get<
        ApiResponse<{ data: TripHistoryItem[]; total: number; page: number; limit: number; totalPages: number }>
      >(`/api/trips?${params.toString()}`);
      return data.data!;
    },
    placeholderData: keepPreviousData,
  });

  const trips = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pb-12 pt-10 text-white">
        <h1 className="text-xl font-bold">Trip History</h1>
        <p className="mt-1 text-sm text-slate-300">Your past trips</p>
      </div>

      <div className="safe-area-pb mx-auto -mt-6 w-full max-w-lg space-y-3 px-4 pb-6">
        {/* Status filter */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.value
                  ? "bg-primary-600 text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isError ? (
          <div className="rounded-2xl bg-white shadow-sm">
            <ErrorState message="Could not load your trips." onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
        ) : trips.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm">
            <EmptyState
              illustration="trips"
              title={statusFilter ? `No ${statusFilter.toLowerCase()} trips` : "No trips yet"}
              description={
                statusFilter
                  ? "Try a different filter."
                  : "Completed trips will appear here once you start driving."
              }
            />
          </div>
        ) : (
          <>
            {trips.map((trip) => (
              <article key={trip.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    {trip.completedAt
                      ? formatDateTime(trip.completedAt)
                      : formatDateTime(trip.createdAt)}
                  </div>
                  <Badge label={trip.status} size="sm" />
                </div>

                <p className="mb-2 text-xs font-medium text-slate-400">
                  Passenger: <span className="text-slate-600">{fullName(trip.passenger)}</span>
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="shrink-0 text-success-500" />
                    <p className="truncate text-sm text-gray-600">{trip.booking.pickupAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation size={13} className="shrink-0 text-danger-500" />
                    <p className="truncate text-sm text-gray-600">{trip.booking.destinationAddress}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <Wallet className="h-4 w-4 text-gray-400" />
                    {formatCurrency(trip.booking.totalFare)}
                  </div>
                </div>
              </article>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="press flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="press flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
