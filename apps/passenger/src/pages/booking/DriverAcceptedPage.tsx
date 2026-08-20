import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { Phone, MessageCircle, Star, Shield, Navigation } from "lucide-react";
import Map from "@/components/Map";

export default function DriverAcceptedPage() {
  const navigate = useNavigate();
  const { driverInfo, pickup, setBookingStatus } = useBookingStore();
  const [eta, setEta] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setBookingStatus("in_transit");
          navigate("/booking/active");
          return 0;
        }
        return prev - 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [navigate, setBookingStatus]);

  if (!driverInfo) return null;

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Map */}
      <div className="relative h-[45dvh] shrink-0">
        <Map pickup={pickup} driverLocation={driverInfo.location} className="w-full h-full" />
      </div>

      {/* Driver info panel */}
      <div className="flex-1 px-5 pt-5 pb-8 space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2.5 rounded-xl">
          <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-primary-900">Driver is on the way</span>
          <span className="ml-auto text-sm font-bold text-primary-600">{eta} min</span>
        </div>

        {/* Driver card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl font-bold text-primary-600">
              {driverInfo.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">{driverInfo.name}</h3>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-400" fill="currentColor" />
                <span className="text-xs font-medium text-slate-600">{driverInfo.rating}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${driverInfo.phone}`}
                className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700"
              >
                <Phone size={16} />
              </a>
              <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200">
                <MessageCircle size={16} />
              </button>
            </div>
          </div>

          {/* Vehicle info */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
            <span className="text-2xl">🛺</span>
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
            <p className="text-sm font-medium text-slate-900 truncate">{pickup?.address || "Current Location"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
