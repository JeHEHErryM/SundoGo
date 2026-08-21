import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Clock, User, Phone, Check, X } from "lucide-react";
import api from "@/lib/api";
import { useDriverStore } from "@/stores/driver.store";
import { BookingStatus } from "@sundogo/types";
import type { ApiResponse } from "@sundogo/types";

const COUNTDOWN = 15;

const DEMO_BOOKING = {
  id: "demo-1",
  passengerId: "p1",
  serviceAreaId: "sa-1",
  status: BookingStatus.REQUESTED,
  pickupLat: 14.5995,
  pickupLng: 120.9842,
  pickupAddress: "Rizal Park, Manila",
  destinationLat: 14.5547,
  destinationLng: 121.05,
  destinationAddress: "SM Makati",
  tripDistanceKm: 5.2,
  pickupDistanceKm: 1.3,
  tripFare: 85,
  pickupFee: 15,
  platformFee: 10,
  totalFare: 110,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function BookingRequestPage() {
  const navigate = useNavigate();
  const { currentBooking, acceptBooking, clearBooking } = useDriverStore();
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN);

  const booking = currentBooking ?? DEMO_BOOKING;

  useEffect(() => {
    if (timeLeft <= 0) {
      clearBooking();
      navigate("/user/driver/", { replace: true });
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, clearBooking, navigate]);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse>("/api/bookings/accept", { bookingId: booking.id });
      return data;
    },
    onSuccess: () => {
      acceptBooking(booking);
      navigate("/user/driver/booking/navigate", { replace: true });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/bookings/reject", { bookingId: booking.id });
    },
    onSuccess: () => {
      clearBooking();
      navigate("/user/driver/", { replace: true });
    },
  });

  const timerPct = (timeLeft / COUNTDOWN) * 100;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-5 pt-12 pb-20 text-white">
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

      <div className="mx-auto -mt-12 w-full max-w-lg space-y-4 px-4 pb-6">
        {/* Booking Card */}
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">Passenger</p>
              <p className="text-sm text-gray-500">Rating: 4.8 ⭐</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <Phone className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-success-500" />
              <div>
                <p className="text-xs font-medium text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-gray-800">{booking.pickupAddress ?? "Unknown location"}</p>
              </div>
            </div>
            <div className="ml-1.5 border-l-2 border-dashed border-gray-200 h-4" />
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-danger-500" />
              <div>
                <p className="text-xs font-medium text-gray-400">Destination</p>
                <p className="text-sm font-medium text-gray-800">{booking.destinationAddress ?? "Unknown destination"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-400">Distance to Pickup</p>
              <p className="text-lg font-bold text-primary-600">{booking.pickupDistanceKm ?? "—"} km</p>
            </div>
            <div className="rounded-xl bg-success-50 p-3 text-center">
              <p className="text-xs text-gray-400">Estimated Fare</p>
              <p className="text-lg font-bold text-success-600">₱{booking.totalFare.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => rejectMutation.mutate()}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-danger-200 bg-danger-50 py-4 text-base font-semibold text-danger-600 transition-all hover:bg-danger-100 active:scale-[0.98]"
          >
            <X className="h-5 w-5" />
            Reject
          </button>
          <button
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-success-500 py-4 text-base font-semibold text-white shadow-lg shadow-success-500/25 transition-all hover:bg-success-600 active:scale-[0.98]"
          >
            <Check className="h-5 w-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
