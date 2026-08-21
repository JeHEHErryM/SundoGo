import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBookingStore } from "../../stores/booking.store";
import { Phone, Star, Shield, Navigation, Bike, Loader2, XCircle } from "lucide-react";
import Map from "../../Map";
import api from "@/lib/api";
import { getSocket, BOOKING_EVENTS } from "@/lib/socket";
import { Avatar } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";
import { BookingStatus } from "@sundogo/types";

interface BookingDetail {
  id: string;
  status: BookingStatus;
  pickupAddress: string;
  totalFare: string | number;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl?: string;
    vehicle?: { vehicleType: string; plateNumber: string } | null;
  } | null;
}

const STATUS_COPY: Record<string, string> = {
  [BookingStatus.ACCEPTED]: "Driver accepted your booking",
  [BookingStatus.DRIVER_ARRIVING]: "Driver is on the way",
  [BookingStatus.DRIVER_ARRIVED]: "Driver has arrived",
};

export default function DriverAcceptedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentBooking, driverInfo, pickup, setDriverInfo, clearBooking } = useBookingStore();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["passenger", "booking", currentBooking],
    enabled: !!currentBooking,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BookingDetail>>(`/api/bookings/${currentBooking}`);
      return data.data!;
    },
    refetchInterval: 3000,
  });

  // Keep local driver info in sync with the server record.
  useEffect(() => {
    if (!booking?.driver || driverInfo) return;
    setDriverInfo({
      id: booking.driver.id,
      name: [booking.driver.firstName, booking.driver.lastName].filter(Boolean).join(" "),
      phone: booking.driver.phone,
      avatar: booking.driver.avatarUrl,
      vehicleType: booking.driver.vehicle?.vehicleType ?? "Tricycle",
      plateNumber: booking.driver.vehicle?.plateNumber ?? "—",
      rating: 5,
    });
  }, [booking, driverInfo, setDriverInfo]);

  // React to status changes.
  useEffect(() => {
    if (!booking) return;
    if (booking.status === BookingStatus.IN_PROGRESS) {
      navigate("/user/passenger/booking/active", { replace: true });
    } else if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED
    ) {
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
    socket.on(BOOKING_EVENTS.DRIVER_ARRIVING, onEvent);
    socket.on(BOOKING_EVENTS.DRIVER_ARRIVED, onEvent);
    socket.on(BOOKING_EVENTS.TRIP_STARTED, onEvent);
    socket.on(BOOKING_EVENTS.TRIP_COMPLETED, onEvent);
    socket.on(BOOKING_EVENTS.CANCELLED, onEvent);
    return () => {
      socket.off(BOOKING_EVENTS.DRIVER_ARRIVING, onEvent);
      socket.off(BOOKING_EVENTS.DRIVER_ARRIVED, onEvent);
      socket.off(BOOKING_EVENTS.TRIP_STARTED, onEvent);
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

  const statusCopy =
    (booking && STATUS_COPY[booking.status]) || "Driver is being dispatched";

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Map */}
      <div className="relative h-[45dvh] shrink-0">
        <Map pickup={pickup} className="w-full h-full" />
      </div>

      {/* Driver info panel */}
      <div className="flex-1 px-5 pt-5 pb-8 space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2.5 rounded-xl">
          <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-primary-900">{statusCopy}</span>
        </div>

        {/* Driver card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={driverInfo.name} src={driverInfo.avatar} size="lg" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">{driverInfo.name}</h3>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-400" fill="currentColor" />
                <span className="text-xs font-medium text-slate-600">{driverInfo.rating}</span>
              </div>
            </div>
            <a
              href={`tel:${driverInfo.phone}`}
              aria-label="Call driver"
              className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700"
            >
              <Phone size={16} />
            </a>
          </div>

          {/* Vehicle info */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
            <span className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600 shrink-0">
              <Bike size={20} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{driverInfo.vehicleType}</p>
              <p className="text-xs text-slate-500">Plate: {driverInfo.plateNumber}</p>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Shield size={14} />
              <span className="text-xs font-medium">Verified</span>
            </div>
          </div>
        </div>

        {/* Pickup info */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
          <Navigation size={16} className="text-primary-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 uppercase">Pickup Point</p>
            <p className="text-sm font-medium text-slate-900 truncate">
              {booking?.pickupAddress || pickup?.address || "Current Location"}
            </p>
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <XCircle size={12} />
          The trip starts automatically once your driver begins the ride.
        </p>
      </div>
    </div>
  );
}
