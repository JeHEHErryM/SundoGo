import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Navigation, User, Phone, MapPin, MessageSquare, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useDriverStore } from "@/stores/driver.store";
import type { Trip, ApiResponse } from "@sundogo/types";

export default function NavigateToPickupPage() {
  const navigate = useNavigate();
  const { currentBooking } = useDriverStore();

  const startTripMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<Trip>>("/api/trips/start", {
        bookingId: currentBooking?.id,
      });
      return data.data!;
    },
    onSuccess: (trip) => {
      useDriverStore.getState().startTrip(trip);
      navigate("/user/driver/booking/active", { replace: true });
    },
  });

  const booking = currentBooking;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* Map Placeholder */}
      <div className="relative h-[45dvh] bg-gradient-to-br from-primary-800 to-primary-600">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
          <Navigation className="h-16 w-16 mb-3 animate-pulse" />
          <p className="text-sm font-medium">Navigation to Pickup</p>
          <p className="text-xs opacity-60 mt-1">Map will show turn-by-turn directions</p>
        </div>

        {/* Pickup pin illustration */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-success-500 shadow-lg shadow-success-500/40 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-success-500" />
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
        >
          ←
        </button>
      </div>

      {/* Bottom Sheet */}
      <div className="mx-auto -mt-6 w-full max-w-lg flex-1 rounded-t-3xl bg-white px-5 pt-6 pb-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Heading to Pickup</h2>
            <p className="text-sm text-gray-500">{booking?.pickupAddress ?? "Pickup location"}</p>
          </div>
          {booking?.pickupDistanceKm && (
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
              {booking.pickupDistanceKm} km
            </span>
          )}
        </div>

        {/* Passenger Info */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Passenger</p>
            <p className="text-sm text-gray-500">Waiting at pickup</p>
          </div>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600 transition-colors hover:bg-success-200">
              <Phone className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 transition-colors hover:bg-primary-200">
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Route Info */}
        <div className="mb-4 rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-success-500" />
              <div className="h-8 w-0.5 bg-gray-200" />
              <div className="h-3 w-3 rounded-full bg-danger-500" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-gray-800">{booking?.pickupAddress ?? "Pickup"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Destination</p>
                <p className="text-sm font-medium text-gray-800">{booking?.destinationAddress ?? "Destination"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arrived Button */}
        <button
          onClick={() => startTripMutation.mutate()}
          disabled={startTripMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60"
        >
          {startTripMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <MapPin className="h-5 w-5" />
              Arrived at Pickup — Start Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
}
