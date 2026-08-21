import { lazy, Suspense } from "react";
import MapPlaceholder, { type MapProps } from "./MapPlaceholder";

// Mapbox GL is heavy (~250KB) — load it on demand instead of in the main bundle.
const MapboxMap = lazy(() => import("./MapboxMap"));

const hasToken = !!import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Real Mapbox map when a token is configured, placeholder otherwise.
 * Same prop interface for both, so callers never care which renders.
 */
export default function Map(props: MapProps) {
  if (!hasToken) return <MapPlaceholder {...props} />;
  return (
    <Suspense fallback={<MapPlaceholder {...props} className={`${props.className ?? ""}`} />}>
      <MapboxMap {...props} />
    </Suspense>
  );
}

export type { MapProps } from "./MapPlaceholder";
