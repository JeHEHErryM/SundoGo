import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Wallet, Home } from "lucide-react";
import { useDriverStore } from "@/stores/driver.store";

export default function TripCompletedPage() {
  const navigate = useNavigate();
  const { currentBooking, clearTrip, clearBooking } = useDriverStore();

  // Transient summary: if there's nothing to show, go home.
  useEffect(() => {
    if (!currentBooking) navigate("/user/driver/", { replace: true });
  }, [currentBooking, navigate]);

  const fare = currentBooking?.totalFare ?? 0;
  const platformFee = currentBooking?.platformFee ?? 0;
  const driverEarning = fare - platformFee;

  const handleDone = () => {
    clearTrip();
    clearBooking();
    navigate("/user/driver/", { replace: true });
  };

  if (!currentBooking) return null;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <div className="bg-gradient-to-br from-success-600 to-success-700 px-5 pt-16 pb-20 text-white text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 mb-4" />
        <h1 className="text-2xl font-bold">Trip Completed!</h1>
        <p className="mt-1 text-sm text-success-100">Great job! Here&apos;s your trip summary.</p>
      </div>

      <div className="mx-auto -mt-10 w-full max-w-lg space-y-4 px-4 pb-6">
        {/* Payment Card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Cash Payment</p>
          <p className="mt-2 text-4xl font-bold text-gray-800">₱{fare.toFixed(2)}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-400">Trip Fare</p>
              <p className="font-semibold text-gray-700">₱{fare.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-danger-50 p-3">
              <p className="text-xs text-gray-400">Platform Fee</p>
              <p className="font-semibold text-danger-600">-₱{platformFee.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-success-50 p-4">
            <p className="text-sm text-success-600">Your Earning</p>
            <p className="text-2xl font-bold text-success-700">₱{driverEarning.toFixed(2)}</p>
          </div>
        </div>

        {/* Trip Details */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Trip Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-success-500" />
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="text-sm font-medium">{currentBooking?.pickupAddress ?? "Pickup"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-danger-500" />
              <div>
                <p className="text-xs text-gray-400">To</p>
                <p className="text-sm font-medium">{currentBooking?.destinationAddress ?? "Destination"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
              <Wallet className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">{currentBooking?.tripDistanceKm ?? "—"} km • Cash Payment</p>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={handleDone}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[0.98]"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
