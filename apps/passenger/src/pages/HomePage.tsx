import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { Search, Clock, Star, Shield, ChevronRight } from "lucide-react";
import Map from "@/components/Map";

const recentDestinations = [
  { id: "1", address: "SM City Cebu", detail: "Juana Osmeña St, Cebu City", icon: "🏢" },
  { id: "2", address: "Cebu IT Park", detail: "Natalio Bacalso Ave, Cebu City", icon: "💻" },
  { id: "3", address: "Carbon Market", detail: "Magsaysay St, Cebu City", icon: "🛒" },
];

const quickActions = [
  { label: "Send Package", icon: "📦", color: "bg-amber-50 text-amber-600" },
  { label: "Schedule Ride", icon: "📅", color: "bg-purple-50 text-purple-600" },
  { label: "Share Location", icon: "📍", color: "bg-green-50 text-green-600" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const setDestination = useBookingStore((s) => s.setDestination);

  const handleDestinationSelect = (address: string, detail: string) => {
    setDestination({ lat: 10.3157, lng: 123.8854, address, detail });
    navigate("/booking");
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Map area */}
      <div className="relative h-[45dvh]">
        <Map className="w-full h-full" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-6 px-4 space-y-4">
        {/* Search bar */}
        <button
          onClick={() => navigate("/booking")}
          className="w-full flex items-center gap-3 h-14 px-4 bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 hover:shadow-xl transition-shadow text-left"
        >
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
            <Search size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Where to?</p>
            <p className="text-xs text-slate-400">Search destination</p>
          </div>
        </button>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${action.color} transition-transform active:scale-95`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Recent destinations */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Recent Destinations</h3>
            </div>
            <button className="text-xs text-primary-600 font-medium">See all</button>
          </div>
          {recentDestinations.map((dest, i) => (
            <button
              key={dest.id}
              onClick={() => handleDestinationSelect(dest.address, dest.detail)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${
                i < recentDestinations.length - 1 ? "border-b border-slate-50" : ""
              }`}
            >
              <span className="text-lg">{dest.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{dest.address}</p>
                <p className="text-xs text-slate-400 truncate">{dest.detail}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </button>
          ))}
        </div>

        {/* Safety info */}
        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-2xl">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={18} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-900">Your safety matters</p>
            <p className="text-xs text-primary-600/70">All trips are tracked and drivers are verified</p>
          </div>
        </div>

        {/* Promo banner */}
        <div className="bg-gradient-to-r from-primary-600 to-cyan-500 p-4 rounded-2xl text-white mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} className="text-yellow-300" fill="currentColor" />
            <span className="text-sm font-bold">50% OFF</span>
          </div>
          <p className="text-sm font-medium">First ride discount!</p>
          <p className="text-xs opacity-80">Use code SUNDogo50 at checkout</p>
        </div>
      </div>
    </div>
  );
}
