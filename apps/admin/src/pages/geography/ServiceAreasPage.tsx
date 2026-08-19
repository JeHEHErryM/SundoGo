import { useState } from "react";
import { MapPin, ToggleLeft, ToggleRight } from "lucide-react";
import StatusBadge, { getStatusVariant } from "@/components/StatusBadge";

interface ServiceArea {
  id: string;
  name: string;
  status: string;
  maxRadius: number;
  activeDrivers: number;
  activeBookings: number;
}

const areas: ServiceArea[] = [
  { id: "SA001", name: "Nairobi CBD", status: "enabled", maxRadius: 15, activeDrivers: 120, activeBookings: 34 },
  { id: "SA002", name: "Westlands", status: "enabled", maxRadius: 8, activeDrivers: 85, activeBookings: 22 },
  { id: "SA003", name: "Karen", status: "enabled", maxRadius: 10, activeDrivers: 45, activeBookings: 8 },
  { id: "SA004", name: "Kiambu County", status: "enabled", maxRadius: 25, activeDrivers: 32, activeBookings: 5 },
  { id: "SA005", name: "Mombasa", status: "disabled", maxRadius: 12, activeDrivers: 0, activeBookings: 0 },
  { id: "SA006", name: "Kisumu", status: "disabled", maxRadius: 10, activeDrivers: 0, activeBookings: 0 },
  { id: "SA007", name: "Thika", status: "enabled", maxRadius: 8, activeDrivers: 18, activeBookings: 3 },
  { id: "SA008", name: "Ruiru", status: "enabled", maxRadius: 6, activeDrivers: 22, activeBookings: 4 },
];

export default function ServiceAreasPage() {
  const [areaList, setAreaList] = useState(areas);

  const toggleArea = (id: string) => {
    setAreaList((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "enabled" ? "disabled" : "enabled" }
          : a
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Service Areas</h1>
        <p className="text-sm text-slate-500">Manage geographic coverage and service zones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Active Service Areas</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {areaList.map((area) => (
                <div key={area.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary-50">
                    <MapPin size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{area.name}</p>
                      <StatusBadge
                        label={area.status}
                        variant={getStatusVariant(area.status)}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Max radius: {area.maxRadius} km · {area.activeDrivers} drivers · {area.activeBookings} active bookings
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500">Radius (km):</label>
                      <input
                        type="number"
                        defaultValue={area.maxRadius}
                        className="w-16 px-2 py-1 rounded border border-slate-300 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                        min={1}
                        max={100}
                      />
                    </div>
                    <button
                      onClick={() => toggleArea(area.id)}
                      className={`p-1 rounded transition-colors ${
                        area.status === "enabled"
                          ? "text-emerald-500 hover:text-emerald-600"
                          : "text-slate-300 hover:text-slate-400"
                      }`}
                    >
                      {area.status === "enabled" ? (
                        <ToggleRight size={28} />
                      ) : (
                        <ToggleLeft size={28} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geofence Placeholder */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Geofence Map</h2>
          <div className="aspect-square rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-4">
            <MapPin size={48} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">Map Visualization</p>
            <p className="text-xs text-slate-400 mt-1">
              Geofence boundaries will be displayed here. Integrate with a map provider (Google Maps, Mapbox, etc.) to visualize service areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
