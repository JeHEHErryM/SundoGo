import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useBookingStore } from "../../stores/booking.store";
import { ArrowLeft, Clock, Route, Banknote, Bike, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { LoadingOverlay } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";

interface ServiceArea {
  id: string;
  name: string;
  enabled: boolean;
}

interface FareEstimateResponse {
  tripDistanceKm: number;
  tripFare: number;
  pickupFee: number;
  platformFee: number;
  total: number;
}

export default function FareEstimatePage() {
  const navigate = useNavigate();
  const { pickup, destination, fareEstimate, setFareEstimate, setBookingStatus, setCurrentBooking, setTripInfo } =
    useBookingStore();
  const [serviceAreaId, setServiceAreaId] = useState("");

  // Resolve the service area for pricing.
  useEffect(() => {
    api
      .get<ApiResponse<ServiceArea[]>>("/api/service-areas/enabled")
      .then(({ data }) => {
        const area = data.data?.[0];
        if (area) setServiceAreaId(area.id);
      })
      .catch(() => undefined);
  }, []);

  const estimateQuery = useQuery({
    queryKey: ["passenger", "fare-estimate", pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, serviceAreaId],
    enabled: !!pickup && !!destination && !!serviceAreaId,
    queryFn: async () => {
      const params = new URLSearchParams({
        pickupLat: String(pickup!.lat),
        pickupLng: String(pickup!.lng),
        destLat: String(destination!.lat),
        destLng: String(destination!.lng),
        serviceAreaId,
      });
      const { data } = await api.get<ApiResponse<FareEstimateResponse>>(`/api/pricing/estimate?${params.toString()}`);
      return data.data!;
    },
  });

  useEffect(() => {
    if (!pickup || !destination) {
      navigate("/user/passenger/booking");
      return;
    }
    if (estimateQuery.data) {
      const est = estimateQuery.data;
      setFareEstimate({
        tripFare: est.tripFare,
        pickupFee: est.pickupFee,
        platformFee: est.platformFee,
        total: est.total,
      });
      setTripInfo(Math.round(est.tripDistanceKm * 10) / 10, Math.round(est.tripDistanceKm * 4));
    }
  }, [pickup, destination, navigate, setFareEstimate, setTripInfo, estimateQuery.data]);

  const createBooking = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<{ id: string }>>("/api/bookings", {
        pickupLat: pickup!.lat,
        pickupLng: pickup!.lng,
        pickupAddress: pickup!.address,
        destinationLat: destination!.lat,
        destinationLng: destination!.lng,
        destinationAddress: destination!.address,
        serviceAreaId,
      });
      return data.data!;
    },
    onSuccess: (booking) => {
      setCurrentBooking(booking.id);
      setBookingStatus("searching");
      navigate("/user/passenger/booking/searching");
    },
  });

  if (!pickup || !destination) return null;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <LoadingOverlay show={createBooking.isPending} message="Creating your booking ..." />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 pb-3 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Fare Estimate</h1>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {/* Route summary */}
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex flex-col items-center gap-0.5">
              <div className="h-3 w-3 rounded-full bg-primary-600" />
              <div className="h-8 w-0.5 bg-slate-300" />
              <div className="h-3 w-3 rounded-full bg-emerald-600" />
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Pickup</p>
                <p className="truncate text-sm font-medium text-slate-900">{pickup.address}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Destination</p>
                <p className="truncate text-sm font-medium text-slate-900">{destination.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
              <Route size={16} className="text-primary-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {estimateQuery.data ? `${estimateQuery.data.tripDistanceKm.toFixed(1)} km` : "—"}
              </p>
              <p className="text-[11px] text-slate-400">Distance</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {estimateQuery.data ? `${Math.round(estimateQuery.data.tripDistanceKm * 4)} min` : "—"}
              </p>
              <p className="text-[11px] text-slate-400">Est. Time</p>
            </div>
          </div>
        </div>

        {/* Fare breakdown */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="px-4 pb-2 pt-4">
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-primary-600" />
              <h3 className="text-sm font-semibold text-slate-900">Fare Breakdown</h3>
            </div>
          </div>
          <div className="space-y-2.5 px-4 pb-4">
            {estimateQuery.isLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" /> Calculating fare…
              </div>
            ) : estimateQuery.isError ? (
              <p className="py-2 text-sm text-danger-600">
                Could not calculate the fare. Make sure your locations are inside a service area.
              </p>
            ) : fareEstimate ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Trip Fare</span>
                  <span className="font-medium text-slate-900">₱{fareEstimate.tripFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Pickup Fee</span>
                  <span className="font-medium text-slate-900">₱{fareEstimate.pickupFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Platform Fee</span>
                  <span className="font-medium text-slate-900">₱{fareEstimate.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">₱{fareEstimate.total.toFixed(2)}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Vehicle type */}
        <div className="flex items-center gap-3 rounded-2xl bg-primary-50 p-4">
          <Bike size={28} className="shrink-0 text-primary-600" />
          <div>
            <p className="text-sm font-bold text-slate-900">Tricycle</p>
            <p className="text-xs text-slate-500">Affordable &amp; convenient local transport</p>
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <div className="border-t border-slate-100 bg-white px-5 pb-8 pt-4">
        <button
          onClick={() => createBooking.mutate()}
          disabled={!serviceAreaId || !fareEstimate || createBooking.isPending}
          className="press flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-[15px] font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50"
        >
          {createBooking.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : fareEstimate ? (
            <>Confirm Booking — ₱{fareEstimate.total.toFixed(2)}</>
          ) : (
            "Confirm Booking"
          )}
        </button>
        {createBooking.isError && (
          <p className="mt-2 text-center text-xs text-danger-600">
            Could not create the booking. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
