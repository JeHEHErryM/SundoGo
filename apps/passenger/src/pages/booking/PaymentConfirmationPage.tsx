import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { CheckCircle2, Banknote, ArrowRight, Home } from "lucide-react";

export default function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const { fareEstimate, driverInfo, clearBooking } = useBookingStore();
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
  };

  const handleDone = () => {
    clearBooking();
    navigate("/");
  };

  if (confirmed) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Confirmed</h1>
        <p className="text-slate-500 text-sm mb-2">Cash payment of</p>
        <p className="text-3xl font-bold text-slate-900 mb-6">₱{(fareEstimate?.total || 0).toFixed(2)}</p>
        {driverInfo && (
          <p className="text-sm text-slate-500 mb-8">Paid to {driverInfo.name}</p>
        )}

        <button
          onClick={handleDone}
          className="w-full max-w-xs h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <Home size={18} />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Banknote size={28} className="text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Confirm Payment</h1>
        <p className="text-sm text-slate-500 mt-1">Please confirm cash payment with your driver</p>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {/* Amount */}
        <div className="bg-slate-50 rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-500 mb-1">Amount Due</p>
          <p className="text-4xl font-bold text-slate-900">₱{(fareEstimate?.total || 0).toFixed(2)}</p>
        </div>

        {/* Driver */}
        {driverInfo && (
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
              {driverInfo.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{driverInfo.name}</p>
              <p className="text-xs text-slate-500">{driverInfo.vehicleType} • {driverInfo.plateNumber}</p>
            </div>
          </div>
        )}

        {/* Fare breakdown */}
        {fareEstimate && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Trip Fare</span>
              <span className="text-slate-900">₱{fareEstimate.tripFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pickup Fee</span>
              <span className="text-slate-900">₱{fareEstimate.pickupFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Platform Fee</span>
              <span className="text-slate-900">₱{fareEstimate.platformFee.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={handleConfirm}
          className="w-full h-13 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/25 text-[15px]"
        >
          I Have Paid Cash
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
