import { MapPin, Navigation, Car } from "lucide-react";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapPoint extends LatLng {
  address: string;
}

export interface AvailableDriver extends LatLng {
  id: string;
  name?: string;
  vehicle?: string;
}

export interface MapProps {
  pickup?: MapPoint | null;
  destination?: MapPoint | null;
  driverLocation?: LatLng | null;
  userLocation?: LatLng | null;
  availableDrivers?: AvailableDriver[];
  className?: string;
  showRoute?: boolean;
  /** When provided, taps on the map call back with the tapped coordinates. */
  onSelect?: (point: LatLng) => void;
}

/** Static fallback used while the Mapbox bundle loads or when no token is set. */
export default function MapPlaceholder({
  pickup,
  destination,
  driverLocation,
  className = "",
  showRoute = true,
}: MapProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}>
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-[0.15]" style={{
        backgroundImage: `
          linear-gradient(to right, #64748b 1px, transparent 1px),
          linear-gradient(to bottom, #64748b 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Simulated road lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 600" preserveAspectRatio="none">
        <line x1="50" y1="0" x2="200" y2="600" stroke="#475569" strokeWidth="3" strokeDasharray="8,4" />
        <line x1="350" y1="0" x2="150" y2="600" stroke="#475569" strokeWidth="3" strokeDasharray="8,4" />
        <line x1="0" y1="200" x2="400" y2="350" stroke="#475569" strokeWidth="3" strokeDasharray="8,4" />
        <line x1="0" y1="450" x2="400" y2="500" stroke="#475569" strokeWidth="3" strokeDasharray="8,4" />
      </svg>

      {/* Route line */}
      {showRoute && pickup && destination && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d={`M ${30 + (pickup.lng % 40)} ${60 + (pickup.lat % 30)} Q 50 40 ${70 - (destination.lng % 20)} ${30 + (destination.lat % 20)}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeDasharray="3,2"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Pickup pin */}
      {pickup && (
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-full animate-bounce">
          <div className="flex flex-col items-center">
            <div className="bg-primary-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-lg mb-1">
              Pickup
            </div>
            <MapPin size={36} className="text-primary-600 drop-shadow-md" fill="#16a34a" />
          </div>
        </div>
      )}

      {/* Destination pin */}
      {destination && (
        <div className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-full">
          <div className="flex flex-col items-center">
            <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-lg mb-1">
              Destination
            </div>
            <Navigation size={36} className="text-emerald-600 drop-shadow-md" fill="#059669" />
          </div>
        </div>
      )}

      {/* Driver location */}
      {driverLocation && (
        <div className="absolute top-[45%] left-[40%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-10 h-10 bg-primary-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center animate-pulse">
              <Car size={20} className="text-white" />
            </div>
            <div className="absolute -inset-2 bg-primary-400/20 rounded-full animate-ping" />
          </div>
        </div>
      )}

      {/* Center indicator when no pins */}
      {!pickup && !destination && !driverLocation && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-600/50 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}
