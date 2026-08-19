import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, Wallet } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse, Booking } from "@sundogo/types";

interface TripHistoryItem {
  id: string;
  booking: Booking;
  completedAt: string;
  rating?: number;
}

export default function TripHistoryPage() {
  const { data: trips } = useQuery({
    queryKey: ["trip-history"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TripHistoryItem[]>>("/api/driver/trips");
      return data.data ?? [];
    },
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pt-12 pb-12 text-white">
        <h1 className="text-xl font-bold">Trip History</h1>
        <p className="mt-1 text-sm text-slate-300">Your past trips</p>
      </div>

      <div className="mx-auto -mt-6 w-full max-w-lg space-y-3 px-4 pb-6">
        {!trips || trips.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <MapPin className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">No trips yet. Your history will appear here.</p>
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(trip.completedAt).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-700">
                  Completed
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success-500" />
                  <p className="text-sm text-gray-600 truncate">{trip.booking.pickupAddress ?? "Pickup"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-danger-500" />
                  <p className="text-sm text-gray-600 truncate">{trip.booking.destinationAddress ?? "Destination"}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Wallet className="h-4 w-4" />
                  ₱{trip.booking.totalFare.toFixed(2)}
                </div>
                {trip.rating && (
                  <span className="text-sm text-amber-500">{'⭐'.repeat(trip.rating)}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
