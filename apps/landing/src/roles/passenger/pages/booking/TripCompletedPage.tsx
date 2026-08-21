import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../../stores/booking.store";
import { CheckCircle2, Star, Receipt, ChevronRight } from "lucide-react";

export default function TripCompletedPage() {
  const navigate = useNavigate();
  const { pickup, destination, fareEstimate, driverInfo, clearBooking, setBookingStatus } = useBookingStore();

  const handlePay = () => {
    setBookingStatus("payment");
    navigate("/user/passenger/booking/payment");
  };

  const handleRate = () => {
    navigate(`/user/passenger/booking/${driverInfo?.id || "1"}/rate`);
  };

  const handleDone = () => {
    clearBooking();
    navigate("/user/passenger/");
  };

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
                <p className="text-sm font-medium text-slate-900 truncate">{pickup?.address || "Pickup"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">To</p>
                <p className="text-sm font-medium text-slate-900 truncate">{destination?.address || "Destination"}</p>
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
            <p className="text-3xl font-bold text-slate-900">₱{(fareEstimate?.total || 0).toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">Cash Payment</p>
          </div>
        </div>

        {/* Driver info */}
        {driverInfo && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                {driverInfo.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{driverInfo.name}</p>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400" fill="currentColor" />
                  <span className="text-xs text-slate-500">{driverInfo.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-8 space-y-2.5">
        <button
          onClick={handlePay}
          className="w-full h-12 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-600/25"
        >
          Confirm Cash Payment
          <ChevronRight size={18} />
        </button>
        <button
          onClick={handleRate}
          className="w-full h-12 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <Star size={18} />
          Rate Driver
        </button>
        <button
          onClick={handleDone}
          className="w-full h-12 text-slate-500 font-medium rounded-2xl hover:bg-slate-100 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
