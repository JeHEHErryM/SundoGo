import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { Phone, MessageCircle, AlertTriangle, Navigation } from "lucide-react";
import Map from "@/components/Map";

export default function ActiveTripPage() {
  const navigate = useNavigate();
  const { driverInfo, pickup, destination, setBookingStatus } = useBookingStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setBookingStatus("completed");
          navigate("/booking/completed");
          return 100;
        }
        return prev + 5;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [navigate, setBookingStatus]);

  if (!driverInfo) return null;

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Map */}
      <div className="relative h-[40dvh] shrink-0">
        <Map
          pickup={pickup}
          destination={destination}
          driverLocation={driverInfo.location}
          className="w-full h-full"
          showRoute
        />
      </div>

      {/* Trip info */}
      <div className="flex-1 px-5 pt-4 pb-8 space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <Navigation size={12} className="text-primary-600" /> {pickup?.address?.slice(0, 20) || "Pickup"}
            </span>
            <span className="flex items-center gap-1">
              {destination?.address?.slice(0, 20) || "Dest"} <Navigation size={12} className="text-emerald-600" />
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-slate-400 mt-1">{Math.round(progress)}% of trip completed</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2.5 rounded-xl">
          <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-primary-900">Trip in progress</span>
        </div>

        {/* Driver card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-lg font-bold text-primary-600">
              {driverInfo.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900">{driverInfo.name}</h3>
              <p className="text-xs text-slate-500">{driverInfo.vehicleType} • {driverInfo.plateNumber}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${driverInfo.phone}`}
                className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white"
              >
                <Phone size={16} />
              </a>
              <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Safety */}
        <button className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
          <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-red-900">Emergency</p>
            <p className="text-xs text-red-600/70">Tap to alert authorities and contacts</p>
          </div>
        </button>
      </div>
    </div>
  );
}
