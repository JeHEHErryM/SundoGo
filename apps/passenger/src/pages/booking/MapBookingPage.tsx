import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { ArrowLeft, MapPin, Navigation, Search, X, LocateFixed } from "lucide-react";
import Map from "@/components/Map";

export default function MapBookingPage() {
  const navigate = useNavigate();
  const { pickup, destination, setPickup, setDestination, setBookingStatus } = useBookingStore();
  const [tab, setTab] = useState<"pickup" | "destination">(pickup ? "destination" : "pickup");
  const [search, setSearch] = useState("");
  const [simulating, setSimulating] = useState(false);

  const handleSimulateLocation = () => {
    setSimulating(true);
    setTimeout(() => {
      const loc = {
        lat: 10.3157 + (Math.random() - 0.5) * 0.02,
        lng: 123.8854 + (Math.random() - 0.5) * 0.02,
        address: tab === "pickup" ? "Current Location" : search || "Selected Destination",
      };
      if (tab === "pickup") {
        setPickup(loc);
        setTab("destination");
      } else {
        setDestination(loc);
      }
      setSimulating(false);
    }, 800);
  };

  const handleConfirm = () => {
    if (pickup && destination) {
      setBookingStatus("fare_estimate");
      navigate("/booking/fare");
    }
  };

  const handleClear = (field: "pickup" | "destination") => {
    if (field === "pickup") {
      setPickup(null as never);
      setTab("pickup");
    } else {
      setDestination(null as never);
      setTab("destination");
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Map */}
      <div className="relative flex-1 min-h-[40dvh]">
        <Map pickup={pickup} destination={destination} className="w-full h-full" showRoute={!!pickup && !!destination} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
        >
          <ArrowLeft size={20} className="text-slate-700" />
        </button>

        {/* Center pin indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="flex flex-col items-center">
            <MapPin size={32} className={tab === "pickup" ? "text-primary-600" : "text-emerald-600"} fill={tab === "pickup" ? "#2563eb" : "#059669"} />
            <div className="w-3 h-1 bg-black/10 rounded-full blur-sm mt-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-5 pt-5 pb-8 space-y-4">
        {/* Route dots */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-3 h-3 rounded-full bg-primary-600 border-2 border-primary-200" />
            <div className="w-0.5 h-5 bg-slate-200" />
            <div className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-emerald-200" />
          </div>

          <div className="flex-1 space-y-2">
            {/* Pickup */}
            <button
              onClick={() => setTab("pickup")}
              className={`w-full flex items-center gap-3 h-11 px-3 rounded-xl border transition-colors ${
                tab === "pickup" ? "border-primary-500 bg-primary-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              {pickup ? (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{pickup.address}</p>
                </div>
              ) : (
                <span className="text-sm text-slate-400">Pickup location</span>
              )}
              {pickup && (
                <button onClick={(e) => { e.stopPropagation(); handleClear("pickup"); }} className="p-1 hover:bg-slate-200 rounded-lg">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </button>

            {/* Destination */}
            <button
              onClick={() => setTab("destination")}
              className={`w-full flex items-center gap-3 h-11 px-3 rounded-xl border transition-colors ${
                tab === "destination" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              {destination ? (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{destination.address}</p>
                </div>
              ) : (
                <span className="text-sm text-slate-400">Where are you going?</span>
              )}
              {destination && (
                <button onClick={(e) => { e.stopPropagation(); handleClear("destination"); }} className="p-1 hover:bg-slate-200 rounded-lg">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </button>
          </div>
        </div>

        {/* Search input */}
        {(tab === "pickup" && !pickup) || (tab === "destination" && !destination) ? (
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "pickup" ? "Search pickup location" : "Search destination"}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-primary-500 transition-colors"
              autoFocus
            />
          </div>
        ) : null}

        {/* Simulate button (placeholder for map location selection) */}
        <button
          onClick={handleSimulateLocation}
          disabled={simulating}
          className="w-full h-11 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
        >
          {simulating ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LocateFixed size={16} />
              {tab === "pickup" ? "Use Current Location" : "Pick on Map"}
            </>
          )}
        </button>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!pickup || !destination}
          className="w-full h-13 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-600/25 text-[15px]"
        >
          <Navigation size={18} />
          Get Fare Estimate
        </button>
      </div>
    </div>
  );
}
