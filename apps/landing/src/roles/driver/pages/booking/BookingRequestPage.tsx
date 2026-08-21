import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Phone, Check, X } from "lucide-react";
import api from "@/lib/api";
import { getSocket, BOOKING_EVENTS } from "@/lib/socket";
import { useDriverStore } from "@/stores/driver.store";
import { Avatar, LoadingOverlay } from "@/components/shared";
import { BookingStatus } from "@sundogo/types";
import type { ApiResponse, Booking } from "@sundogo/types";

const COUNTDOWN = 30;

type OfferBooking = Booking & {
  passenger?: { firstName: string; lastName: string; phone: string; avatarUrl?: string } | null;
};

export default function BookingRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const acceptBooking = useDriverStore((s) => s.acceptBooking);
  const setPendingOffer = useDriverStore((s) => s.setPendingOffer);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN);

  // Poll as a fallback in case the socket push was missed.
  const { data: offer, isLoading } = useQuery({
    queryKey: ["driver", "pending-offer"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OfferBooking | null>>("/api/bookings/offers/pending");
      return data.data ?? null;
    },
    refetchInterval: 5000,
  });

  // Live refresh when a new offer is pushed.
  useEffect(() => {
    const socket = getSocket();
    const onOffer = () => {
      void queryClient.invalidateQueries({ queryKey: ["driver", "pending-offer"] });
      setTimeLeft(COUNTDOWN);
    };
    socket.on(BOOKING_EVENTS.OFFER, onOffer);
    return () => {
      socket.off(BOOKING_EVENTS.OFFER, onOffer);
    };
  }, [queryClient]);

  // Keep store in sync so Home shows the active-booking card.
  useEffect(() => {
    setPendingOffer(offer ?? null);
  }, [offer, setPendingOffer]);

  const reject = useMutation({
    mutationFn: async (bookingId: string) => {
      await api.post(`/api/bookings/${bookingId}/reject-offer`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["driver", "pending-offer"] });
      setTimeLeft(COUNTDOWN);
    },
  });

  const accept = useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await api.patch<ApiResponse<OfferBooking>>(`/api/bookings/${bookingId}/status`, {
        status: BookingStatus.ACCEPTED,
      });
      return data.data!;
    },
    onSuccess: (booking) => {
      acceptBooking(booking);
      navigate("/user/driver/booking/navigate", { replace: true });
    },
  });

  // Auto-decline when the countdown expires.
  useEffect(() => {
    if (!offer) return;
    if (timeLeft <= 0) {
      if (!reject.isPending) reject.mutate(offer.id);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, offer]);

  // No pending offer → back home.
  useEffect(() => {
    if (!isLoading && !offer && !accept.isPending) {
      navigate("/user/driver/", { replace: true });
    }
  }, [isLoading, offer, accept.isPending, navigate]);

  if (isLoading || !offer) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const timerPct = (timeLeft / COUNTDOWN) * 100;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <LoadingOverlay show={accept.isPending} message="Accepting booking ..." />

      <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-5 pb-20 pt-10 text-white">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h1 className="text-xl font-bold">New Booking Request</h1>
        </div>

        {/* Timer Ring */}
        <div className="mt-6 flex justify-center">
          <div className="relative h-24 w-24">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - timerPct / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{timeLeft}s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="safe-area-pb mx-auto -mt-12 w-full max-w-lg space-y-4 px-4 pb-6">
        {/* Booking Card */}
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Avatar
              name={
                [offer.passenger?.firstName, offer.passenger?.lastName].filter(Boolean).join(" ") ||
                "Passenger"
              }
              src={offer.passenger?.avatarUrl}
              size="lg"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {[offer.passenger?.firstName, offer.passenger?.lastName].filter(Boolean).join(" ") || "Passenger"}
              </p>
              {offer.passenger?.phone && (
                <a href={`tel:${offer.passenger.phone}`} className="flex items-center gap-1 text-sm text-gray-500">
                  <Phone size={11} /> {offer.passenger.phone}
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-success-500" />
              <div>
                <p className="text-xs font-medium text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-gray-800">{offer.pickupAddress ?? "Unknown location"}</p>
              </div>
            </div>
            <div className="ml-1.5 h-4 border-l-2 border-dashed border-gray-200" />
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-danger-500" />
              <div>
                <p className="text-xs font-medium text-gray-400">Destination</p>
                <p className="text-sm font-medium text-gray-800">{offer.destinationAddress ?? "Unknown destination"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-400">Distance to Pickup</p>
              <p className="text-lg font-bold text-primary-600">
                {offer.pickupDistanceKm != null ? `${Number(offer.pickupDistanceKm).toFixed(1)} km` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-success-50 p-3 text-center">
              <p className="text-xs text-gray-400">Estimated Fare</p>
              <p className="text-lg font-bold text-success-600">₱{Number(offer.totalFare).toFixed(0)}</p>
            </div>
          </div>
        </div>

        {accept.isError && (
          <p className="rounded-xl bg-danger-50 px-4 py-3 text-center text-sm text-danger-700">
            Could not accept — the booking may have been taken. Looking for the next one…
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => reject.mutate(offer.id)}
            disabled={reject.isPending}
            className="press flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-danger-200 bg-danger-50 py-4 text-base font-semibold text-danger-600 transition-all hover:bg-danger-100 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
            Reject
          </button>
          <button
            onClick={() => accept.mutate(offer.id)}
            disabled={accept.isPending}
            className="press flex flex-1 items-center justify-center gap-2 rounded-2xl bg-success-500 py-4 text-base font-semibold text-white shadow-lg shadow-success-500/25 transition-all hover:bg-success-600 disabled:opacity-60"
          >
            <Check className="h-5 w-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
