import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";

// Mamburao, Occidental Mindoro — service area center fallback.
const FALLBACK = { lat: 13.1184, lng: 120.6106 };

/**
 * Continuously tracks the driver's own position for map display.
 * Falls back to the service area center when GPS is unavailable.
 */
export function useDriverGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const lastSyncedAt = useRef(0);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(next);
        if (Date.now() - lastSyncedAt.current >= 5000) {
          lastSyncedAt.current = Date.now();
          void api.patch("/api/drivers/location", next).catch(() => {
            // A temporary location sync failure should not stop local tracking.
          });
        }
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
