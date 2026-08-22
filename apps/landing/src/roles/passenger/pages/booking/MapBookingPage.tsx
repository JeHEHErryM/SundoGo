import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "../../stores/booking.store";
import {
  ArrowLeft, MapPin, Navigation, Search, X, LocateFixed, Loader2, Maximize2,
  Minimize2, Minus, Plus, Users, Clock3,
  RotateCcw,
} from "lucide-react";
import Map from "../../Map";
import { reverseGeocode } from "@/lib/geocode";
import api from "@/lib/api";
import { usePassengerGeolocation } from "../../hooks/usePassengerGeolocation";
import type { ApiResponse } from "@sundogo/types";
import type { AvailableDriver } from "../../Map";

// Mamburao, Occidental Mindoro — service area center.
const MAMBURAO_CENTER = { lat: 13.1184, lng: 120.6106 };

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const lat = ((b.lat - a.lat) * Math.PI) / 180;
  const lng = ((b.lng - a.lng) * Math.PI) / 180;
  const value =
    Math.sin(lat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(lng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export default function MapBookingPage() {
  const navigate = useNavigate();
  const { pickup, destination, setPickup, setDestination } = useBookingStore();
  const [tab, setTab] = useState<"pickup" | "destination">(pickup ? "destination" : "pickup");
  const [search, setSearch] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [resolving, setResolving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [radiusKm, setRadiusKm] = useState(2);
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [resetSignal, setResetSignal] = useState(0);
  const userLocation = usePassengerGeolocation();

  const { data: availableDrivers = [] } = useQuery({
    queryKey: ["passenger", "available-drivers", "mamburao-default"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Array<{
        id: string;
        firstName: string;
        lastName: string;
        currentLat: number | string;
        currentLng: number | string;
        vehicle?: { model?: string; plateNumber?: string } | null;
      }>>>("/api/drivers/available/mamburao-default");
      return (data.data ?? []).map<AvailableDriver>((driver) => ({
        id: driver.id,
        lat: Number(driver.currentLat),
        lng: Number(driver.currentLng),
        name: `${driver.firstName} ${driver.lastName}`.trim(),
        vehicle: driver.vehicle?.plateNumber ?? driver.vehicle?.model,
      }));
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const searchCenter = pickup ?? userLocation;
  const nearbyDrivers = searchCenter
    ? availableDrivers.filter((driver) => distanceKm(searchCenter, driver) <= radiusKm)
    : [];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const changeRadius = (delta: number) => {
    const next = Math.min(5, Math.max(0.5, radiusKm + delta));
    if (delta > 0 && radiusKm >= 5) {
      showToast("Maximum search range is 5 km from pickup.");
      return;
    }
    setRadiusKm(next);
  };

  const movePoint = async (field: "pickup" | "destination", point: { lat: number; lng: number }) => {
    const address = await reverseGeocode(point.lat, point.lng);
    const next = { ...point, address: address === "Selected location" ? "Pinned location" : address };
    if (field === "pickup") setPickup(next);
    else setDestination(next);
  };

  const applyPoint = async (lat: number, lng: number, fallbackAddress: string) => {
    setResolving(true);
    const address = await reverseGeocode(lat, lng);
    setResolving(false);
    const loc = { lat, lng, address: address === "Selected location" ? fallbackAddress : address };
    if (tab === "pickup") {
      setPickup(loc);
      setTab("destination");
    } else {
      setDestination(loc);
    }
  };

  const handleMapSelect = (point: { lat: number; lng: number }) => {
    setLocationError("");
    void applyPoint(point.lat, point.lng, tab === "pickup" ? "Pickup location" : search.trim() || "Destination");
  };

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

  const resetMap = () => {
    setPickup(null as never);
    setDestination(null as never);
    setTab("pickup");
    setSearch("");
    setRadiusKm(2);
    setResetSignal((value) => value + 1);
  };

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-dvh"} flex flex-col bg-white`}>
      {/* Map */}
      <div className={`relative flex-1 ${isFullscreen ? "min-h-0" : "min-h-[40dvh]"}`}>
        <Map
          pickup={pickup}
          destination={destination}
          userLocation={userLocation}
          availableDrivers={nearbyDrivers}
          searchRadiusKm={radiusKm}
          draggablePickup={!!pickup}
          draggableDestination={!!destination}
          onMovePickup={(point) => void movePoint("pickup", point)}
          onMoveDestination={(point) => void movePoint("destination", point)}
          resetSignal={resetSignal}
          showRoute={!!pickup && !!destination}
          onSelect={(!pickup || !destination) ? handleMapSelect : undefined}
        />

        {/* Map controls remain available in fullscreen mode. */}
        <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between sm:inset-x-5 sm:top-5">
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur transition-transform hover:bg-white active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <button
              onClick={resetMap}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur transition-transform hover:bg-white active:scale-95"
              aria-label="Reset map"
              title="Reset map"
            >
              <RotateCcw size={18} className="text-slate-700" />
            </button>
          </div>
          <button
            onClick={() => setIsFullscreen((value) => !value)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur transition-transform hover:bg-white active:scale-95"
            aria-label={isFullscreen ? "Exit fullscreen map" : "Open fullscreen map"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        <div className="absolute left-1/2 top-16 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur sm:top-5">
          <Users size={14} className="text-primary-600" />
          {nearbyDrivers.length} nearby
          <span className="hidden items-center gap-1 border-l border-slate-200 pl-2 font-medium text-slate-500 sm:flex">
            <Clock3 size={13} className="text-slate-400" />
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-4 z-10 flex flex-wrap items-end justify-between gap-2 sm:inset-x-5 sm:bottom-5">
          <div className="rounded-2xl bg-white/95 p-2 shadow-lg backdrop-blur">
            <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Search range
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeRadius(-0.5)}
                disabled={radiusKm <= 0.5}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40"
                aria-label="Decrease search range"
              ><Minus size={14} /></button>
              <span className="w-12 text-center text-sm font-bold text-slate-800">{radiusKm} km</span>
              <button
                onClick={() => changeRadius(0.5)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700"
                aria-label="Increase search range"
              ><Plus size={14} /></button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={useCurrentLocation}
              disabled={locating}
              className="flex h-10 items-center gap-2 rounded-xl bg-white/95 px-3 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur hover:bg-white disabled:opacity-60"
            >
              {locating ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
              <span className="hidden sm:inline">My location</span>
            </button>
            {isFullscreen && (
              <button
                onClick={handleConfirm}
                disabled={!pickup || !destination}
                className="h-10 rounded-xl bg-primary-600 px-4 text-xs font-bold text-white shadow-lg disabled:opacity-40"
              >
                Get fare
              </button>
            )}
          </div>
        </div>

        <div className="absolute inset-x-3 top-28 z-10 flex justify-center sm:inset-x-auto sm:left-5 sm:top-20 sm:justify-start">
          <div className="flex gap-1 rounded-xl bg-white/95 p-1 shadow-lg backdrop-blur">
          <button
            onClick={() => setTab("pickup")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === "pickup" ? "bg-primary-600 text-white" : "text-slate-600"}`}
          >Pickup</button>
          <button
            onClick={() => setTab("destination")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === "destination" ? "bg-primary-600 text-white" : "text-slate-600"}`}
          >Destination</button>
          </div>
        </div>

        {toast && (
          <div className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-center text-xs font-semibold text-white shadow-xl sm:bottom-28">
            {toast}
          </div>
        )}

        {/* Tap hint */}
        {(!pickup || !destination) && (
          <div className="pointer-events-none absolute inset-x-0 top-40 flex justify-center px-4 sm:top-20">
            <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
              {resolving ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Resolving address ...
                </>
              ) : (
                <>
                  <MapPin size={12} /> Tap the map to set your {tab === "pickup" ? "pickup" : "destination"}
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Bottom panel */}
      {!isFullscreen && <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-5 pt-5 pb-8 space-y-4">
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
      </div>}
    </div>
  );
}
