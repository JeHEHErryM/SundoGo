import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import { Skeleton, EmptyState, ErrorState, formatDateTime, formatCurrency, fullName } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";
import { BookingStatus } from "@sundogo/types";

interface HistoryBooking {
  id: string;
  status: BookingStatus;
  pickupAddress: string;
  destinationAddress: string;
  totalFare: string;
  createdAt: string;
  driver?: { firstName: string; lastName: string } | null;
}

const FILTERS = [
  { value: "", label: "All" },
  { value: BookingStatus.COMPLETED, label: "Completed" },
  { value: BookingStatus.CANCELLED, label: "Cancelled" },
];

export default function TripHistoryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["passenger", "bookings", page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (filter) params.set("status", filter);
      const { data } = await api.get<
        ApiResponse<{ data: HistoryBooking[]; total: number; totalPages: number }>
      >(`/api/bookings?${params.toString()}`);
      return data.data!;
    },
    placeholderData: keepPreviousData,
  });

  const bookings = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-5 pb-4 pt-5">
        <h1 className="text-xl font-bold text-slate-900">Trip History</h1>
        <p className="mt-0.5 text-sm text-slate-500">Your recent rides</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value);
              setPage(1);
            }}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value ? "bg-primary-600 text-white" : "bg-white text-slate-500 shadow-sm hover:text-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Trip list */}
      <div className="safe-area-pb space-y-3 px-5 pb-8 pt-2">
        {isError ? (
          <div className="rounded-2xl bg-white shadow-sm">
            <ErrorState message="Could not load your trips." onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm">
            <EmptyState
              illustration="trips"
              title={filter ? `No ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} trips` : "No trips yet"}
              description={
                filter
                  ? "Try a different filter."
                  : "Book your first ride and your history will show up here."
              }
              action={
                !filter && (
                  <button
                    onClick={() => navigate("/user/passenger/booking")}
                    className="press rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Book a Ride
                  </button>
                )
              }
            />
          </div>
        ) : (
          <>
            {bookings.map((booking) => {
              const completed = booking.status === BookingStatus.COMPLETED;
              return (
                <button
                  key={booking.id}
                  onClick={() => navigate("/user/passenger/history")}
                  className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {completed ? (
                        <CheckCircle2 size={16} className="text-success-500" />
                      ) : booking.status === BookingStatus.CANCELLED ? (
                        <XCircle size={16} className="text-danger-400" />
                      ) : (
                        <span className="h-4 w-4 animate-pulse rounded-full bg-info-400" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          completed
                            ? "text-success-600"
                            : booking.status === BookingStatus.CANCELLED
                              ? "text-danger-500"
                              : "text-info-600"
                        }`}
                      >
                        {booking.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDateTime(booking.createdAt)}</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex flex-col items-center gap-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary-500" />
                      <div className="h-4 w-0.5 bg-slate-200" />
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{booking.pickupAddress}</p>
                      <div className="h-2" />
                      <p className="truncate text-sm font-medium text-slate-900">{booking.destinationAddress}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-3">
                      {Number(booking.totalFare) > 0 && (
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(booking.totalFare)}</span>
                      )}
                      {booking.driver && (
                        <span className="text-xs text-slate-400">with {fullName(booking.driver)}</span>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </button>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
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
