import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Feature, FeatureCollection, LineString } from "geojson";
import type { MapProps } from "./MapPlaceholder";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
// Mamburao, Occidental Mindoro — service area center.
const DEFAULT_CENTER: [number, number] = [120.6106, 13.1184];
const ROUTE_SOURCE = "route";
const ROUTE_LAYER = "route-line";

function pinElement(color: string, label: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "flex flex-col items-center";
  el.innerHTML = `
    <div style="background:${color};color:#fff;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);margin-bottom:4px;">${label}</div>
    <svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" stroke="#fff" stroke-width="1.5" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35));">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/>
      <circle cx="12" cy="10" r="3" fill="#fff"/>
    </svg>`;
  return el;
}

function driverElement(): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = `
    <div style="position:relative;width:36px;height:36px;">
      <div style="position:absolute;inset:-8px;border-radius:9999px;background:#16a34a33;"></div>
      <div style="position:relative;width:36px;height:36px;border-radius:9999px;background:#16a34a;border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <path d="M9 17h6"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    </div>`;
  return el.firstElementChild as HTMLElement;
}

/** Fetches a driving route between two points as GeoJSON, or null when unavailable. */
async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<Feature<LineString> | null> {
  try {
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson&access_token=${TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const coords = json?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    return {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: coords },
    };
  } catch {
    return null;
  }
}

export default function MapboxMap({
  pickup,
  destination,
  driverLocation,
  className = "",
  showRoute = true,
  onSelect,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{
    pickup?: mapboxgl.Marker;
    destination?: mapboxgl.Marker;
    driver?: mapboxgl.Marker;
  }>({});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const didFitRef = useRef(false);
  const [styleReady, setStyleReady] = useState(false);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      accessToken: TOKEN,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_CENTER,
      zoom: 13,
      attributionControl: true,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource(ROUTE_SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: ROUTE_LAYER,
        type: "line",
        source: ROUTE_SOURCE,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#16a34a",
          "line-width": 5,
          "line-opacity": 0.85,
        },
      });
      setStyleReady(true);
    });

    map.on("click", (e) => {
      onSelectRef.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
      didFitRef.current = false;
    };
  }, []);

  // Sync markers with props.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = (
      key: "pickup" | "destination" | "driver",
      point: { lat: number; lng: number } | null | undefined,
      makeEl: () => HTMLElement,
    ) => {
      if (!point) {
        markersRef.current[key]?.remove();
        markersRef.current[key] = undefined;
        return;
      }
      if (!markersRef.current[key]) {
        markersRef.current[key] = new mapboxgl.Marker({ element: makeEl() })
          .setLngLat([point.lng, point.lat])
          .addTo(map);
      } else {
        markersRef.current[key]!.setLngLat([point.lng, point.lat]);
      }
    };

    sync("pickup", pickup, () => pinElement("#16a34a", "Pickup"));
    sync("destination", destination, () => pinElement("#0f172a", "Destination"));
    sync("driver", driverLocation, driverElement);
  }, [pickup, destination, driverLocation]);

  // Draw the route and fit the viewport once points are known.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady) return;
    let cancelled = false;

    const draw = async () => {
      const source = map.getSource(ROUTE_SOURCE) as mapboxgl.GeoJSONSource | undefined;
      if (!source || cancelled) return;

      let feature: Feature<LineString> | null = null;
      if (showRoute && pickup && destination) {
        feature = await fetchRoute(pickup, destination);
      } else if (showRoute && driverLocation && pickup) {
        feature = await fetchRoute(driverLocation, pickup);
      }
      if (cancelled) return;
      source.setData({
        type: "FeatureCollection",
        features: feature ? [feature] : [],
      } as FeatureCollection);

      if (didFitRef.current) return;
      const points = [pickup, destination, driverLocation].filter(Boolean) as { lat: number; lng: number }[];
      if (points.length === 0) return;

      const bounds = new mapboxgl.LngLatBounds();
      points.forEach((p) => bounds.extend([p.lng, p.lat]));
      if (feature) {
        // Directions geometry is always [lng, lat] pairs.
        for (const c of feature.geometry.coordinates as [number, number][]) bounds.extend(c);
      }
      didFitRef.current = true;
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 800 });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [styleReady, pickup, destination, driverLocation, showRoute]);

  return <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`} />;
}
