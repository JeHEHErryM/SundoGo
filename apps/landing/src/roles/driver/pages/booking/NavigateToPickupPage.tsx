import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation, Phone, MapPin, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useDriverStore } from "@/stores/driver.store";
import { useActiveBooking } from "@/roles/driver/hooks/useActiveBooking";
import { Avatar, LoadingOverlay } from "@/components/shared";
import { BookingStatus } from "@sundogo/types";

export default function NavigateToPickupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const acceptBooking = useDriverStore((s) => s.acceptBooking);

  const { data: booking, isLoading } = useActiveBooking();

  // Keep the store fresh for other pages.
  useEffect(() => {
    if (booking) acceptBooking(booking);
  }, [booking, acceptBooking]);

  const advance = useMutation({
    mutationFn: async (nextStatus: BookingStatus) => {
      const { data } = await api.patch(`/api/bookings/${booking!.id}/status`, { status: nextStatus });
      return data.data;
    },
    onSuccess: (_data, nextStatus) => {
      void queryClient.invalidateQueries({ queryKey: ["driver", "active-booking"] });
      if (nextStatus === BookingStatus.IN_PROGRESS) {
        navigate("/user/driver/booking/active", { replace: true });
      }
    },
  });

  // No active booking to navigate to.
  useEffect(() => {
    if (!isLoading && !booking) navigate("/user/driver/", { replace: true });
    if (booking?.status === BookingStatus.IN_PROGRESS) {
      navigate("/user/driver/booking/active", { replace: true });
    }
  }, [isLoading, booking, navigate]);

  if (isLoading || !booking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const step =
    booking.status === BookingStatus.ACCEPTED
      ? { label: "I'm on My Way", next: BookingStatus.DRIVER_ARRIVING }
      : booking.status === BookingStatus.DRIVER_ARRIVING
        ? { label: "Arrived at Pickup", next: BookingStatus.DRIVER_ARRIVED }
        : { label: "Start Trip", next: BookingStatus.IN_PROGRESS };

  const stepIndex = { [BookingStatus.ACCEPTED]: 0, [BookingStatus.DRIVER_ARRIVING]: 1, [BookingStatus.DRIVER_ARRIVED]: 2 }[
    booking.status as "ACCEPTED" | "DRIVER_ARRIVING" | "DRIVER_ARRIVED"
  ] ?? 0;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <LoadingOverlay show={advance.isPending} message="Updating trip status ..." />

      {/* Map Placeholder */}
      <div className="relative h-[45dvh] bg-gradient-to-br from-primary-800 to-primary-600">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
          <Navigation className="mb-3 h-16 w-16 animate-pulse" />
          <p className="text-sm font-medium">Navigation to Pickup</p>
          <p className="mt-1 text-xs opacity-60">Map will show turn-by-turn directions</p>
        </div>

        {/* Pickup pin illustration */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-500 shadow-lg shadow-success-500/40">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-success-500" />
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/user/driver/", { replace: true })}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Bottom Sheet */}
      <div className="safe-area-pb mx-auto -mt-6 w-full max-w-lg flex-1 rounded-t-3xl bg-white px-5 pb-6 pt-6 shadow-lg">
        {/* Stepper */}
        <div className="mb-5 flex items-center gap-2">
          {["Accepted", "On the way", "Arrived"].map((label, i) => (
            <div key={label} className="flex flex-1 flex-col gap-1.5">
              <div
                className={`h-1.5 rounded-full ${i <= stepIndex ? "bg-primary-500" : "bg-gray-200"}`}
              />
              <span
                className={`text-[10px] font-medium uppercase tracking-wide ${
                  i <= stepIndex ? "text-primary-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Heading to Pickup</h2>
            <p className="text-sm text-gray-500">{booking.pickupAddress ?? "Pickup location"}</p>
          </div>
          {booking.pickupDistanceKm != null && (
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
              {Number(booking.pickupDistanceKm).toFixed(1)} km
            </span>
          )}
        </div>

        {/* Passenger Info */}
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
            <p className="text-sm text-gray-500">Waiting at pickup</p>
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
                <p className="text-sm font-medium text-gray-800">{booking.pickupAddress ?? "Pickup"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Destination</p>
                <p className="text-sm font-medium text-gray-800">{booking.destinationAddress ?? "Destination"}</p>
              </div>
            </div>
          </div>
        </div>

        {advance.isError && (
          <p className="mb-3 rounded-xl bg-danger-50 px-4 py-2.5 text-center text-sm text-danger-700">
            Something went wrong. Please try again.
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={() => advance.mutate(step.next)}
          disabled={advance.isPending}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60"
        >
          {advance.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <MapPin className="h-5 w-5" />
              {step.label}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
