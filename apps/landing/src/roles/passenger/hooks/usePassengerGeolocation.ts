import { useEffect, useState } from "react";

export interface PassengerPosition {
  lat: number;
  lng: number;
}

/** Tracks the passenger location while the booking map is open. */
export function usePassengerGeolocation() {
  const [position, setPosition] = useState<PassengerPosition | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (current) => {
        setPosition({ lat: current.coords.latitude, lng: current.coords.longitude });
      },
      () => {
        // Keep the map usable when permission is denied; the user can still
        // choose a pickup by tapping the map or using the fallback button.
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return position;
}
