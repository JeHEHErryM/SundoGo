import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import Badge from "@/components/shared/Badge";
import Sheet from "@/components/shared/Sheet";
import { Skeleton } from "@/components/shared/Skeleton";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { useToast } from "@/components/shared";

interface ServiceArea {
  id: string;
  name: string;
  enabled: boolean;
  maxBookingRadiusKm: number;
  geofence: unknown;
}

export default function ServiceAreasPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<ServiceArea | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", maxBookingRadiusKm: 10 });

  const { data: areas, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "service-areas"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ServiceArea[]>>("/api/service-areas");
      return data.data ?? [];
    },
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "service-areas"] });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; enabled?: boolean; name?: string; maxBookingRadiusKm?: number }) => {
      await api.patch(`/api/service-areas/${id}`, payload);
    },
    onSuccess: () => {
      toast("success", "Service area updated");
      setEditing(null);
      invalidate();
    },
    onError: () => toast("error", "Failed to update service area"),
  });

  const create = useMutation({
    mutationFn: async (payload: { name: string; maxBookingRadiusKm: number }) => {
      // Minimal rectangular geofence around Mamburao center; refine coordinates later.
      await api.post("/api/service-areas", {
        ...payload,
        enabled: true,
        geofence: {
          type: "Polygon",
          coordinates: [
            [
              [120.5806, 13.0884],
              [120.6406, 13.0884],
              [120.6406, 13.1484],
              [120.5806, 13.1484],
              [120.5806, 13.0884],
            ],
          ],
        },
      });
    },
    onSuccess: () => {
      toast("success", "Service area created");
      setCreateOpen(false);
      setForm({ name: "", maxBookingRadiusKm: 10 });
      invalidate();
    },
    onError: () => toast("error", "Failed to create service area"),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Service Areas"
        description="Manage geographic coverage and booking radius limits"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            New Area
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isError ? (
            <div className="rounded-2xl border border-slate-200 bg-white">
              <ErrorState message="Could not load service areas." onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] rounded-2xl" />
              ))}
            </div>
          ) : (areas ?? []).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white">
              <EmptyState
                illustration="search"
                title="No service areas"
                description="Create your first coverage zone to start accepting bookings."
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-xs">
              {(areas ?? []).map((area) => (
                <li key={area.id} className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="rounded-xl bg-primary-50 p-2.5">
                    <MapPin size={18} className="text-primary-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{area.name}</p>
                      <Badge label={area.enabled ? "ENABLED" : "DISABLED"} size="sm" />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Max booking radius: {area.maxBookingRadiusKm} km
                    </p>
                  </div>

                  {/* Enable toggle */}
                  <button
                    role="switch"
                    aria-checked={area.enabled}
                    aria-label={`Toggle ${area.name}`}
                    disabled={update.isPending}
                    onClick={() => update.mutate({ id: area.id, enabled: !area.enabled })}
                    className={`toggle-switch ${area.enabled ? "!bg-primary-600" : ""}`}
                  >
                    <span className={`toggle-dot ${area.enabled ? "translate-x-5" : ""}`} />
                  </button>

                  <button
                    onClick={() => setEditing(area)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label={`Edit ${area.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Geofence placeholder */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="mb-4 text-base font-bold text-slate-900">Geofence Map</h2>
          <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <MapPin size={44} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Map Visualization</p>
            <p className="mt-1 text-xs text-slate-400">
              Geofence boundaries will render here once a map provider is integrated.
            </p>
          </div>
        </aside>
      </div>

      {/* Edit sheet */}
      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Edit Service Area">
        {editing && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({
                id: editing.id,
                name: form.name.trim() || editing.name,
                maxBookingRadiusKm: form.maxBookingRadiusKm,
              });
            }}
          >
            <div>
              <label htmlFor="area-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="area-name"
                type="text"
                value={form.name || editing.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="area-radius" className="mb-1.5 block text-sm font-medium text-slate-700">
                Max Booking Radius (km)
              </label>
              <input
                id="area-radius"
                type="number"
                min={0}
                value={form.maxBookingRadiusKm}
                onChange={(e) => setForm((f) => ({ ...f, maxBookingRadiusKm: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={update.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Sheet>

      {/* Create sheet */}
      <Sheet open={createOpen} onClose={() => setCreateOpen(false)} title="New Service Area">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (form.name.trim()) create.mutate({ name: form.name.trim(), maxBookingRadiusKm: form.maxBookingRadiusKm });
          }}
        >
          <div>
            <label htmlFor="new-area-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="new-area-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Mamburao Proper"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="new-area-radius" className="mb-1.5 block text-sm font-medium text-slate-700">
              Max Booking Radius (km)
            </label>
            <input
              id="new-area-radius"
              type="number"
              min={0}
              value={form.maxBookingRadiusKm}
              onChange={(e) => setForm((f) => ({ ...f, maxBookingRadiusKm: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <p className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
            New areas start with a default Mamburao-center geofence. Adjust the polygon via API or seed data for precise boundaries.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              Create Area
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}
