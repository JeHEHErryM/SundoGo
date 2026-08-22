import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "../../stores/booking.store";
import {
  ArrowLeft, MapPin, Navigation, Search, X, LocateFixed, Loader2, Maximize2,
  Minimize2, Minus, Plus, Users, Clock3,
  RotateCcw, CircleHelp, Gauge,
} from "lucide-react";
import Map from "../../Map";
import { reverseGeocode, searchPlaces } from "@/lib/geocode";
import api from "@/lib/api";
import { usePassengerGeolocation } from "../../hooks/usePassengerGeolocation";
import type { ApiResponse } from "@sundogo/types";
import type { AvailableDriver } from "../../Map";

// Mamburao, Occidental Mindoro — service area center.
const MAMBURAO_CENTER = { lat: 13.22, lng: 120.59 };

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [radiusKm, setRadiusKm] = useState(2);
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [resetSignal, setResetSignal] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [rangeExpanded, setRangeExpanded] = useState(false);
  const userLocation = usePassengerGeolocation();
  const deferredSearch = useDeferredValue(search);

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

  const { data: placeSuggestions = [], isFetching: searchingPlaces } = useQuery({
    queryKey: ["mapbox", "places", deferredSearch, userLocation?.lat, userLocation?.lng],
    queryFn: () => searchPlaces(deferredSearch, userLocation ?? MAMBURAO_CENTER),
    enabled: deferredSearch.trim().length >= 2,
    staleTime: 30000,
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
    const address = await reverseGeocode(lat, lng);
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
        if (!Number.isFinite(pos.coords.latitude) || !Number.isFinite(pos.coords.longitude)) {
          setLocationError("Could not read your device location.");
          return;
        }
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
        showToast("Location permission unavailable. Using Mamburao town center.");
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

  const selectSuggestion = (place: { name: string; lat: number; lng: number }) => {
    const point = { ...place, address: place.name };
    if (tab === "pickup") {
      setPickup(point);
      setTab("destination");
    } else {
      setDestination(point);
    }
    setSearch("");
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
    <div className={`${isFullscreen ? "fixed inset-0 z-[60] h-[100dvh] max-h-[100dvh] overflow-hidden" : "min-h-[calc(100dvh-3.5rem)] overflow-x-hidden"} flex flex-col bg-white`}>
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
          <div className="flex gap-2">
            <button
              onClick={() => setTutorialOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur transition-transform hover:bg-white active:scale-95"
              aria-label="How to book a ride"
              title="How to book a ride"
            >
              <CircleHelp size={18} className="text-slate-700" />
            </button>
            <button
              onClick={() => setIsFullscreen((value) => !value)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur transition-transform hover:bg-white active:scale-95"
              aria-label={isFullscreen ? "Exit fullscreen map" : "Open fullscreen map"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        <div className="absolute left-3 top-[3.75rem] z-10 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur sm:left-1/2 sm:top-5 sm:-translate-x-1/2">
          <Users size={14} className="text-primary-600" />
          {nearbyDrivers.length} nearby
          <span className="hidden items-center gap-1 border-l border-slate-200 pl-2 font-medium text-slate-500 sm:flex">
            <Clock3 size={13} className="text-slate-400" />
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className={`absolute inset-x-3 z-10 flex flex-wrap items-end justify-between gap-2 sm:inset-x-5 ${isFullscreen ? "bottom-4" : "bottom-20 sm:bottom-5"}`}>
          <div className="flex min-w-0 flex-wrap items-end gap-2">
            {rangeExpanded ? (
              <div className="rounded-2xl bg-white/95 p-2 shadow-lg backdrop-blur">
                <div className="mb-1 flex items-center justify-between gap-3 px-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search range</span>
                  <button onClick={() => setRangeExpanded(false)} className="text-xs font-semibold text-primary-600">Done</button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeRadius(-0.5)} disabled={radiusKm <= 0.5} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40" aria-label="Decrease search range"><Minus size={14} /></button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">{radiusKm} km</span>
                  <button onClick={() => changeRadius(0.5)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700" aria-label="Increase search range"><Plus size={14} /></button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setRangeExpanded(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/95 text-primary-700 shadow-lg backdrop-blur hover:bg-white"
                aria-label={`Expand search range, currently ${radiusKm} kilometers`}
                title={`Search range: ${radiusKm} km`}
              ><Gauge size={19} /></button>
            )}

            <div className="flex gap-1 rounded-2xl bg-white/95 p-1 shadow-lg backdrop-blur">
              <button onClick={() => setTab("pickup")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${tab === "pickup" ? "bg-primary-600 text-white" : "text-slate-600"}`}>Pickup</button>
              <button onClick={() => setTab("destination")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${tab === "destination" ? "bg-primary-600 text-white" : "text-slate-600"}`}>Destination</button>
            </div>
            {isFullscreen && ((!pickup && tab === "pickup") || (!destination && tab === "destination")) && (
              <div className="relative order-last basis-full sm:order-none sm:basis-auto sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && tab === "destination") confirmDestination(); }}
                  placeholder={tab === "pickup" ? "Search pickup or place" : "Search destination or place"}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 pl-9 pr-3 text-sm shadow-lg outline-none backdrop-blur placeholder:text-slate-400 focus:border-primary-500"
                />
                {search.trim().length >= 2 && (
                  <div className="absolute inset-x-0 bottom-12 max-h-56 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl">
                    {searchingPlaces ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Searching places...</div>
                    ) : placeSuggestions.length > 0 ? placeSuggestions.map((place) => (
                      <button key={`${place.lng}-${place.lat}-${place.name}`} onClick={() => selectSuggestion(place)} className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-primary-600" />
                        <span className="text-sm text-slate-700">{place.name}</span>
                      </button>
                    )) : <p className="px-4 py-3 text-xs text-slate-500">No nearby places found.</p>}
                  </div>
                )}
              </div>
            )}
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

        {toast && (
          <div className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-center text-xs font-semibold text-white shadow-xl sm:bottom-28">
            {toast}
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
            />
            {search.trim().length >= 2 && (
              <div className="absolute inset-x-0 top-12 z-20 max-h-56 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl">
                {searchingPlaces ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Searching places...</div>
                ) : placeSuggestions.length > 0 ? (
                  placeSuggestions.map((place) => (
                    <button
                      key={`${place.lng}-${place.lat}-${place.name}`}
                      onClick={() => selectSuggestion(place)}
                      className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                    >
                      <MapPin size={15} className="mt-0.5 shrink-0 text-primary-600" />
                      <span className="text-sm text-slate-700">{place.name}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-xs text-slate-500">No nearby places found.</p>
                )}
              </div>
            )}
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
      {tutorialOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl sm:rounded-3xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Quick guide</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">How to book a ride</h2>
                <p className="mt-1 text-sm text-slate-500">Choose your route in a few simple steps.</p>
              </div>
              <button
                onClick={() => setTutorialOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                aria-label="Close tutorial"
              ><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                ["1", "Set pickup", "Tap the map, use My location, or search for an address or place."],
                ["2", "Choose destination", "Switch to Destination, then select a map pin or a suggestion."],
                ["3", "Check nearby drivers", "Adjust the search range up to 5 km to see available online drivers."],
                ["4", "Review and confirm", "Drag either pin to fine-tune your route, then tap Get fare."],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">{number}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-400">
              Video walkthrough coming soon
            </div>
            <button
              onClick={() => setTutorialOpen(false)}
              className="mt-5 h-12 w-full rounded-2xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Start booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
