import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBookingStore } from "../../stores/booking.store";
import { Phone, AlertTriangle, Navigation, Loader2 } from "lucide-react";
import Map from "../../Map";
import api from "@/lib/api";
import { Avatar } from "@/components/shared";
import { getSocket, BOOKING_EVENTS } from "@/lib/socket";
import EmergencySheet from "../../components/EmergencySheet";
import type { ApiResponse } from "@sundogo/types";
import { BookingStatus } from "@sundogo/types";

interface BookingDetail {
  id: string;
  status: BookingStatus;
  totalFare: string | number;
  driver?: {
    firstName: string;
    lastName: string;
    phone: string;
    vehicle?: { vehicleType: string; plateNumber: string } | null;
  } | null;
}

export default function ActiveTripPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentBooking, pickup, destination, driverInfo, clearBooking } = useBookingStore();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["passenger", "booking", currentBooking],
    enabled: !!currentBooking,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BookingDetail>>(`/api/bookings/${currentBooking}`);
      return data.data!;
    },
    refetchInterval: 5000,
  });

  // Navigate on completion or cancellation.
  useEffect(() => {
    if (!booking) return;
    if (booking.status === BookingStatus.COMPLETED) {
      navigate("/user/passenger/booking/completed", { replace: true });
    } else if (booking.status === BookingStatus.CANCELLED) {
      clearBooking();
      navigate("/user/passenger/", { replace: true });
    }
  }, [booking, navigate, clearBooking]);

  // Socket push for instant pickup.
  useEffect(() => {
    if (!currentBooking) return;
    const socket = getSocket();
    const onEvent = () => {
      void queryClient.invalidateQueries({ queryKey: ["passenger", "booking", currentBooking] });
    };
    socket.on(BOOKING_EVENTS.TRIP_COMPLETED, onEvent);
    socket.on(BOOKING_EVENTS.CANCELLED, onEvent);
    return () => {
      socket.off(BOOKING_EVENTS.TRIP_COMPLETED, onEvent);
      socket.off(BOOKING_EVENTS.CANCELLED, onEvent);
    };
  }, [currentBooking, queryClient]);

  // No booking to track.
  useEffect(() => {
    if (!currentBooking) navigate("/user/passenger/", { replace: true });
  }, [currentBooking, navigate]);

  if (!currentBooking || isLoading || !driverInfo) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Map */}
      <div className="relative h-[40dvh] shrink-0">
        <Map
          pickup={pickup}
          destination={destination}
          className="w-full h-full"
          showRoute
        />
      </div>

      {/* Trip info */}
      <div className="flex-1 px-5 pt-4 pb-8 space-y-4">
        {/* Route summary */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span className="flex items-center gap-1 min-w-0">
              <Navigation size={12} className="text-primary-600 shrink-0" />
              <span className="truncate">{pickup?.address?.slice(0, 20) || "Pickup"}</span>
            </span>
            <span className="flex items-center gap-1 min-w-0">
              <span className="truncate">{destination?.address?.slice(0, 20) || "Destination"}</span>
              <Navigation size={12} className="text-emerald-600 shrink-0" />
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full animate-pulse" />
          </div>
          <p className="text-center text-xs text-slate-400 mt-1">En route to your destination</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2.5 rounded-xl">
          <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-primary-900">Trip in progress</span>
        </div>

        {/* Driver card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Avatar name={driverInfo.name} src={driverInfo.avatar} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900">{driverInfo.name}</h3>
              <p className="text-xs text-slate-500">{driverInfo.vehicleType} • {driverInfo.plateNumber}</p>
            </div>
            <a
              href={`tel:${driverInfo.phone}`}
              aria-label="Call driver"
              className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        {/* Fare */}
        {booking && (
          <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl">
            <span className="text-sm text-slate-500">Total fare (cash)</span>
            <span className="text-sm font-bold text-slate-900">₱{Number(booking.totalFare).toFixed(2)}</span>
          </div>
        )}

        {/* Safety */}
        <button
          onClick={() => setEmergencyOpen(true)}
          className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-red-900">Emergency</p>
            <p className="text-xs text-red-600/70">Tap to alert authorities and contacts</p>
          </div>
        </button>
      </div>

      <EmergencySheet open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </div>
  );
}
