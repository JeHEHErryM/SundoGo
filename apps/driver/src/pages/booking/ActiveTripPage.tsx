import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Car, User, Navigation, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useDriverStore } from "@/stores/driver.store";
import { TripStatus } from "@sundogo/types";
import type { ApiResponse } from "@sundogo/types";

export default function ActiveTripPage() {
  const navigate = useNavigate();
  const { activeTrip, currentBooking, completeTrip } = useDriverStore();

  const completeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse>("/api/trips/complete", {
        tripId: activeTrip?.id,
      });
      return data;
    },
    onSuccess: () => {
      completeTrip({ ...activeTrip!, status: TripStatus.COMPLETED });
      navigate("/booking/completed", { replace: true });
    },
  });

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* Map Area */}
      <div className="relative h-[40dvh] bg-gradient-to-br from-slate-700 to-slate-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
          <Car className="h-16 w-16 mb-3 animate-pulse" />
          <p className="text-sm font-medium">Trip In Progress</p>
          <p className="text-xs opacity-50 mt-1">Live navigation active</p>
        </div>

        {/* Trip indicator */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="rounded-full bg-success-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            ● TRIP IN PROGRESS
          </span>
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {currentBooking?.tripDistanceKm ?? "—"} km
          </span>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="mx-auto -mt-6 w-full max-w-lg flex-1 rounded-t-3xl bg-white px-5 pt-6 pb-6 shadow-lg">
        {/* Passenger */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Passenger</p>
            <p className="text-sm text-gray-500">Heading to destination</p>
          </div>
        </div>

        {/* Route */}
        <div className="mb-4 rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-success-500" />
              <div className="h-8 w-0.5 bg-gray-200" />
              <div className="h-3 w-3 rounded-full bg-danger-500" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="text-sm font-medium text-gray-800">{currentBooking?.pickupAddress ?? "Pickup"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">To</p>
                <p className="text-sm font-medium text-gray-800">{currentBooking?.destinationAddress ?? "Destination"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Info */}
        <div className="mb-4 rounded-xl bg-success-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-success-700">Trip Fare</span>
            <span className="text-lg font-bold text-success-700">₱{currentBooking?.totalFare.toFixed(0) ?? "0"}</span>
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-success-500 py-4 text-base font-semibold text-white shadow-lg shadow-success-500/25 transition-all hover:bg-success-600 active:scale-[0.98] disabled:opacity-60"
        >
          {completeMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Navigation className="h-5 w-5" />
              Complete Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
}
