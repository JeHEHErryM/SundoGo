import { useEffect, useState } from "react";

// Mamburao, Occidental Mindoro — service area center fallback.
const FALLBACK = { lat: 13.1184, lng: 120.6106 };

/**
 * Continuously tracks the driver's own position for map display.
 * Falls back to the service area center when GPS is unavailable.
 */
export function useDriverGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setPosition((prev) => prev ?? FALLBACK);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return position;
}
