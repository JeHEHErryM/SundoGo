import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../../stores/booking.store";
import { ArrowLeft, MapPin, Navigation, Search, X, LocateFixed, Loader2 } from "lucide-react";
import Map from "../../Map";

// Mamburao, Occidental Mindoro — service area center.
const MAMBURAO_CENTER = { lat: 13.1184, lng: 120.6106 };

export default function MapBookingPage() {
  const navigate = useNavigate();
  const { pickup, destination, setPickup, setDestination } = useBookingStore();
  const [tab, setTab] = useState<"pickup" | "destination">(pickup ? "destination" : "pickup");
  const [search, setSearch] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const useCurrentLocation = () => {
    setLocationError("");
    if (!("geolocation" in navigator)) {
      setLocationError("Location is not available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: "Current Location",
        };
        if (tab === "pickup") {
          setPickup(loc);
          setTab("destination");
        } else {
          setDestination(loc);
        }
      },
      () => {
        setLocating(false);
        // Fall back to the Mamburao town center when permission is denied.
        const loc = {
          ...MAMBURAO_CENTER,
          address: tab === "pickup" ? "Mamburao Town Center" : search || "Mamburao Town Center",
        };
        if (tab === "pickup") {
          setPickup(loc);
          setTab("destination");
        } else {
          setDestination(loc);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const confirmDestination = () => {
    if (!search.trim()) return;
    // Approximate point at the town center until map selection is available.
    setDestination({ ...MAMBURAO_CENTER, address: search.trim() });
  };

  const handleConfirm = () => {
    if (pickup && destination) {
      navigate("/user/passenger/booking/fare");
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
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
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
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); handleClear("pickup"); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleClear("pickup"); }}
                  className="p-1 hover:bg-slate-200 rounded-lg"
                >
                  <X size={14} className="text-slate-400" />
                </span>
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
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); handleClear("destination"); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleClear("destination"); }}
                  className="p-1 hover:bg-slate-200 rounded-lg"
                >
                  <X size={14} className="text-slate-400" />
                </span>
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
              onKeyDown={(e) => { if (e.key === "Enter" && tab === "destination") confirmDestination(); }}
              placeholder={tab === "pickup" ? "Search pickup location" : "Search destination"}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-primary-500 transition-colors outline-none"
              autoFocus
            />
          </div>
        ) : null}

        {locationError && (
          <p className="text-xs text-danger-600">{locationError}</p>
        )}

        {/* Location actions */}
        {!pickup || !destination ? (
          <div className="flex gap-2">
            <button
              onClick={useCurrentLocation}
              disabled={locating}
              className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              {locating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <LocateFixed size={16} />
                  Use Current Location
                </>
              )}
            </button>
            {tab === "destination" && search.trim() && !destination && (
              <button
                onClick={confirmDestination}
                className="flex-1 h-11 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <MapPin size={16} />
                Set "{search.trim().slice(0, 18)}{search.trim().length > 18 ? "…" : ""}"
              </button>
            )}
          </div>
        ) : null}

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!pickup || !destination}
          className="press w-full h-13 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-600/25 text-[15px]"
        >
          <Navigation size={18} />
          Get Fare Estimate
        </button>
      </div>
    </div>
  );
}
