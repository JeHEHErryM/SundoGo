import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "../../stores/booking.store";
import { CheckCircle2, Star, Receipt, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Avatar } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";
import { BookingStatus } from "@sundogo/types";

interface BookingDetail {
  id: string;
  status: BookingStatus;
  pickupAddress: string;
  destinationAddress: string;
  tripDistanceKm: string | number;
  tripFare: string | number;
  pickupFee: string | number;
  platformFee: string | number;
  totalFare: string | number;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  } | null;
}

export default function TripCompletedPage() {
  const navigate = useNavigate();
  const { currentBooking, clearBooking } = useBookingStore();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["passenger", "booking", currentBooking],
    enabled: !!currentBooking,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BookingDetail>>(`/api/bookings/${currentBooking}`);
      return data.data!;
    },
  });

  // Redirect home when there is nothing to show.
  useEffect(() => {
    if (!currentBooking) navigate("/user/passenger/", { replace: true });
  }, [currentBooking, navigate]);

  const handleRate = () => {
    if (currentBooking) navigate(`/user/passenger/booking/${currentBooking}/rate`);
  };

  const handleDone = () => {
    clearBooking();
    navigate("/user/passenger/", { replace: true });
  };

  if (!currentBooking || isLoading || !booking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader2 size={28} className="animate-spin text-primary-600" />
      </div>
    );
  }

  const driverName = booking.driver
    ? [booking.driver.firstName, booking.driver.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      {/* Success header */}
      <div className="bg-white px-6 pt-8 pb-6 text-center border-b border-slate-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={36} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Trip Completed</h1>
        <p className="text-sm text-slate-500 mt-1">You've arrived at your destination</p>
      </div>

      <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
        {/* Route summary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-0.5 mt-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
              <div className="w-0.5 h-6 bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">From</p>
                <p className="text-sm font-medium text-slate-900 truncate">{booking.pickupAddress}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">To</p>
                <p className="text-sm font-medium text-slate-900 truncate">{booking.destinationAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fare card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={16} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-slate-900">Trip Fare</h3>
          </div>
          <div className="text-center py-2">
            <p className="text-3xl font-bold text-slate-900">₱{Number(booking.totalFare).toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">Cash Payment</p>
          </div>
          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Trip Fare ({Number(booking.tripDistanceKm).toFixed(1)} km)</span>
              <span>₱{Number(booking.tripFare).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pickup Fee</span>
              <span>₱{Number(booking.pickupFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Platform Fee</span>
              <span>₱{Number(booking.platformFee).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Driver info */}
        {driverName && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <Avatar name={driverName} src={booking.driver?.avatarUrl} size="md" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{driverName}</p>
                <p className="text-xs text-slate-400">Your driver for this trip</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-8 space-y-2.5">
        <button
          onClick={handleRate}
          className="press w-full h-12 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-600/25"
        >
          <Star size={18} />
          Rate Driver
        </button>
        <button
          onClick={() => navigate("/user/passenger/booking/payment")}
          className="w-full h-12 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <Receipt size={18} />
          View Payment Details
        </button>
        <button
          onClick={handleDone}
          className="w-full h-12 text-slate-500 font-medium rounded-2xl hover:bg-slate-100 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
