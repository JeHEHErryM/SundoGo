import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { ArrowLeft, Clock, Route, DollarSign } from "lucide-react";

export default function FareEstimatePage() {
  const navigate = useNavigate();
  const { pickup, destination, fareEstimate, setFareEstimate, setBookingStatus, setTripInfo } = useBookingStore();

  useEffect(() => {
    if (!pickup || !destination) {
      navigate("/booking");
      return;
    }
    // Simulate fare calculation
    const distance = 2.5 + Math.random() * 5;
    const duration = Math.round(distance * 4);
    setTripInfo(Math.round(distance * 10) / 10, duration);
    setFareEstimate({
      tripFare: Math.round(distance * 15 * 100) / 100,
      pickupFee: 15,
      platformFee: 10,
      total: 0,
    });
  }, [pickup, destination, navigate, setFareEstimate, setTripInfo]);

  useEffect(() => {
    if (fareEstimate) {
      const updated = { ...fareEstimate, total: fareEstimate.tripFare + fareEstimate.pickupFee + fareEstimate.platformFee };
      if (fareEstimate.total !== updated.total) {
        setFareEstimate(updated);
      }
    }
  }, [fareEstimate, setFareEstimate]);

  const handleConfirm = () => {
    setBookingStatus("searching");
    navigate("/booking/searching");
  };

  if (!pickup || !destination || !fareEstimate) return null;

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Fare Estimate</h1>
      </div>

      <div className="flex-1 px-5 py-6 space-y-5 overflow-y-auto">
        {/* Route summary */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-0.5 mt-0.5">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <div className="w-0.5 h-8 bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
            </div>
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Pickup</p>
                <p className="text-sm font-medium text-slate-900 truncate">{pickup.address}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Destination</p>
                <p className="text-sm font-medium text-slate-900 truncate">{destination.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Route size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{useBookingStore.getState().tripDistance} km</p>
              <p className="text-[11px] text-slate-400">Distance</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{useBookingStore.getState().tripDuration} min</p>
              <p className="text-[11px] text-slate-400">Est. Time</p>
            </div>
          </div>
        </div>

        {/* Fare breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Fare Breakdown</h3>
            </div>
          </div>
          <div className="px-4 pb-4 space-y-2.5">
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
            <div className="border-t border-slate-100 pt-2.5 flex justify-between">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold text-blue-600">₱{fareEstimate.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Vehicle type */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
          <span className="text-3xl">🛺</span>
          <div>
            <p className="text-sm font-bold text-slate-900">Tricycle</p>
            <p className="text-xs text-slate-500">Affordable &amp; convenient local transport</p>
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <div className="px-5 pb-8 pt-4 border-t border-slate-100 bg-white">
        <button
          onClick={handleConfirm}
          className="w-full h-13 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/25 text-[15px]"
        >
          Confirm Booking — ₱{fareEstimate.total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
