import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBookingStore } from "../../stores/booking.store";
import { X, Bike } from "lucide-react";
import api from "@/lib/api";
import { getSocket, BOOKING_EVENTS } from "@/lib/socket";
import type { ApiResponse } from "@sundogo/types";
import { BookingStatus } from "@sundogo/types";

interface BookingDetail {
  id: string;
  status: BookingStatus;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl?: string;
    averageRating?: number | null;
    vehicle?: { vehicleType: string; plateNumber: string } | null;
  } | null;
}

export default function SearchingDriverPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentBookingId = useBookingStore((s) => s.currentBooking);
  const setDriverInfo = useBookingStore((s) => s.setDriverInfo);
  const setBookingStatus = useBookingStore((s) => s.setBookingStatus);
  const clearBooking = useBookingStore((s) => s.clearBooking);
  const [dots, setDots] = useState("");
  const [elapsed, setElapsed] = useState(0);

  // Animated dots + elapsed timer.
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    const timerInterval = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => {
      clearInterval(dotInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const { data: booking } = useQuery({
    queryKey: ["passenger", "booking", currentBookingId],
    enabled: !!currentBookingId,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BookingDetail>>(`/api/bookings/${currentBookingId}`);
      return data.data!;
    },
    refetchInterval: 3000,
  });

  // React to status changes.
  useEffect(() => {
    if (!booking) return;

    if (booking.status === BookingStatus.ACCEPTED && booking.driver) {
      setDriverInfo({
        id: booking.driver.id,
        name: [booking.driver.firstName, booking.driver.lastName].filter(Boolean).join(" "),
        phone: booking.driver.phone,
        avatar: booking.driver.avatarUrl,
        vehicleType: booking.driver.vehicle?.vehicleType ?? "Tricycle",
        plateNumber: booking.driver.vehicle?.plateNumber ?? "—",
        rating: booking.driver.averageRating ?? 0,
      });
      setBookingStatus("driver_accepted");
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      navigate("/user/passenger/booking/driver-accepted", { replace: true });
    } else if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED
    ) {
      clearBooking();
      navigate("/user/passenger/", { replace: true });
    }
  }, [booking, setDriverInfo, setBookingStatus, clearBooking, navigate, queryClient]);

  // Socket push for instant pickup.
  useEffect(() => {
    if (!currentBookingId) return;
    const socket = getSocket();
    const onAccepted = (payload: { bookingId?: string }) => {
      if (!payload?.bookingId || payload.bookingId === currentBookingId) {
        void queryClient.invalidateQueries({ queryKey: ["passenger", "booking", currentBookingId] });
      }
    };
    socket.on(BOOKING_EVENTS.ACCEPTED, onAccepted);
    socket.on(BOOKING_EVENTS.CANCELLED, onAccepted);
    return () => {
      socket.off(BOOKING_EVENTS.ACCEPTED, onAccepted);
      socket.off(BOOKING_EVENTS.CANCELLED, onAccepted);
    };
  }, [currentBookingId, queryClient]);

  const cancel = useMutation({
    mutationFn: async () => {
      await api.post(`/api/bookings/${currentBookingId}/cancel`, { reason: "Cancelled by passenger" });
    },
    onSuccess: () => {
      clearBooking();
      navigate("/user/passenger/", { replace: true });
    },
  });

  // No booking to track.
  useEffect(() => {
    if (!currentBookingId) navigate("/user/passenger/", { replace: true });
  }, [currentBookingId, navigate]);

  if (!currentBookingId) return null;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-primary-600 to-primary-700 px-6 text-white">
      {/* Cancel button */}
      <button
        onClick={() => !cancel.isPending && cancel.mutate()}
        disabled={cancel.isPending}
        className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Cancel search"
      >
        <X size={20} />
      </button>

      {/* Loading animation */}
      <div className="relative mb-8">
        <div className="h-24 w-24 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Bike size={36} className="text-white" />
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-bold">Looking for a driver{dots}</h2>
      <p className="mb-8 text-sm text-primary-100">This usually takes less than a minute</p>

      {/* Progress indicator */}
      <div className="w-full max-w-xs">
        <div className="h-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-1000"
            style={{ width: `${Math.min((elapsed / 10) * 100, 95)}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-primary-200">Searching nearby drivers...</p>
      </div>

      {elapsed > 60 && (
        <button
          onClick={() => !cancel.isPending && cancel.mutate()}
          className="press mt-8 rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Taking too long? Cancel booking
        </button>
      )}
    </div>
  );
}
