import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation, Loader2, Phone, Siren } from "lucide-react";
import api from "@/lib/api";
import Map from "@/components/map/Map";
import { useDriverStore } from "@/stores/driver.store";
import { useActiveBooking } from "@/roles/driver/hooks/useActiveBooking";
import { useDriverGeolocation } from "@/roles/driver/hooks/useDriverGeolocation";
import { Avatar, LoadingOverlay } from "@/components/shared";
import { getSocket, BOOKING_EVENTS } from "@/lib/socket";
import { BookingStatus } from "@sundogo/types";

export default function ActiveTripPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const acceptBooking = useDriverStore((s) => s.acceptBooking);
  const driverPos = useDriverGeolocation();
  const [emergencyAlert, setEmergencyAlert] = useState<{
    passengerName: string;
    passengerPhone: string;
    message: string | null;
  } | null>(null);

  const { data: booking, isLoading } = useActiveBooking();

  useEffect(() => {
    if (booking) acceptBooking(booking);
  }, [booking, acceptBooking]);

  // Listen for passenger emergency alerts.
  useEffect(() => {
    const socket = getSocket();
    const onEmergency = (payload: {
      passengerName?: string;
      passengerPhone?: string;
      message?: string | null;
    }) => {
      setEmergencyAlert({
        passengerName: payload.passengerName ?? "Your passenger",
        passengerPhone: payload.passengerPhone ?? "",
        message: payload.message ?? null,
      });
    };
    socket.on(BOOKING_EVENTS.EMERGENCY, onEmergency);
    return () => {
      socket.off(BOOKING_EVENTS.EMERGENCY, onEmergency);
    };
  }, []);

  // Route guard: only meaningful while the trip is in progress.
  useEffect(() => {
    if (!isLoading && !booking) navigate("/user/driver/", { replace: true });
    if (booking && booking.status !== BookingStatus.IN_PROGRESS) {
      navigate("/user/driver/booking/navigate", { replace: true });
    }
  }, [isLoading, booking, navigate]);

  const completeMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/api/bookings/${booking!.id}/status`, { status: BookingStatus.COMPLETED });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["driver", "active-booking"] });
      navigate("/user/driver/booking/completed", { replace: true });
    },
  });

  if (isLoading || !booking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <LoadingOverlay show={completeMutation.isPending} message="Completing your trip ..." />

      {/* Live Map */}
      <div className="relative h-[40dvh]">
        <Map
          pickup={
            booking
              ? { lat: booking.pickupLat, lng: booking.pickupLng, address: booking.pickupAddress ?? "Pickup" }
              : null
          }
          destination={
            booking
              ? {
                  lat: booking.destinationLat,
                  lng: booking.destinationLng,
                  address: booking.destinationAddress ?? "Destination",
                }
              : null
          }
          driverLocation={driverPos}
          className="w-full h-full"
          showRoute
        />

        {/* Trip indicator */}
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className="rounded-full bg-success-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            ● TRIP IN PROGRESS
          </span>
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {Number(booking.tripDistanceKm).toFixed(1)} km
          </span>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="safe-area-pb mx-auto -mt-6 w-full max-w-lg flex-1 rounded-t-3xl bg-white px-5 pb-6 pt-6 shadow-lg">
        {/* Emergency alert banner */}
        {emergencyAlert && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <Siren size={20} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-red-900">
                  Emergency alert from {emergencyAlert.passengerName}
                </p>
                {emergencyAlert.message && (
                  <p className="mt-1 text-sm text-red-700">&ldquo;{emergencyAlert.message}&rdquo;</p>
                )}
                {emergencyAlert.passengerPhone && (
                  <a
                    href={`tel:${emergencyAlert.passengerPhone}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    <Phone size={13} />
                    Call passenger
                  </a>
                )}
              </div>
              <button
                onClick={() => setEmergencyAlert(null)}
                aria-label="Dismiss alert"
                className="text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Passenger */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
          <Avatar
            name={
              [booking.passenger?.firstName, booking.passenger?.lastName].filter(Boolean).join(" ") ||
              "Passenger"
            }
            src={booking.passenger?.avatarUrl}
            size="lg"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-800">
              {[booking.passenger?.firstName, booking.passenger?.lastName].filter(Boolean).join(" ") || "Passenger"}
            </p>
            <p className="text-sm text-gray-500">Heading to destination</p>
          </div>
          {booking.passenger?.phone && (
            <a
              href={`tel:${booking.passenger.phone}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600 transition-colors hover:bg-success-200"
              aria-label="Call passenger"
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
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
                <p className="text-sm font-medium text-gray-800">{booking.pickupAddress ?? "Pickup"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">To</p>
                <p className="text-sm font-medium text-gray-800">{booking.destinationAddress ?? "Destination"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Info */}
        <div className="mb-4 rounded-xl bg-success-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-success-700">Trip Fare (Cash)</span>
            <span className="text-lg font-bold text-success-700">₱{Number(booking.totalFare).toFixed(0)}</span>
          </div>
        </div>

        {completeMutation.isError && (
          <p className="mb-3 rounded-xl bg-danger-50 px-4 py-2.5 text-center text-sm text-danger-700">
            Could not complete the trip. Please try again.
          </p>
        )}

        {/* Complete Button */}
        <button
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-success-500 py-4 text-base font-semibold text-white shadow-lg shadow-success-500/25 transition-all hover:bg-success-600 active:scale-[0.98] disabled:opacity-60"
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
