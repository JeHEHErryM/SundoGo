import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Plus, Save, Trash2 } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { Skeleton } from "@/components/shared/Skeleton";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import SegmentedControl from "@/components/shared/SegmentedControl";
import { useToast, formatCurrency } from "@/components/shared";

interface ServiceArea {
  id: string;
  name: string;
  enabled: boolean;
}

interface FareConfig {
  id: string;
  baseFare: string;
  perKmRate: string;
  platformFee: string;
}

interface PickupRule {
  id: string;
  minDistanceKm: string;
  maxDistanceKm: string;
  fee: string;
}

const emptyForm = { baseFare: "", perKmRate: "", platformFee: "" };
const emptyRule = { minDistanceKm: "", maxDistanceKm: "", fee: "" };

export default function FareManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [areaId, setAreaId] = useState("");
  const [configForm, setConfigForm] = useState(emptyForm);
  const [ruleForm, setRuleForm] = useState(emptyRule);
  const [ruleError, setRuleError] = useState("");

  const { data: areas } = useQuery({
    queryKey: ["admin", "service-areas"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ServiceArea[]>>("/api/service-areas");
      return data.data ?? [];
    },
  });

  useEffect(() => {
    if (!areaId && areas && areas.length > 0) setAreaId(areas[0].id);
  }, [areas, areaId]);

  const { data: config, isLoading: configLoading, isError: configError } = useQuery({
    queryKey: ["admin", "fare-config", areaId],
    enabled: !!areaId,
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<FareConfig>>(`/api/pricing/fare-config/${areaId}`);
        return data.data;
      } catch {
        return null;
      }
    },
  });

  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ["admin", "pickup-rules", areaId],
    enabled: !!areaId,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PickupRule[]>>(`/api/pricing/pickup-rules/${areaId}`);
      return data.data ?? [];
    },
  });

  useEffect(() => {
    if (config) {
      setConfigForm({
        baseFare: String(Number(config.baseFare)),
        perKmRate: String(Number(config.perKmRate)),
        platformFee: String(Number(config.platformFee)),
      });
    } else {
      setConfigForm(emptyForm);
    }
  }, [config]);

  const invalidate = (key: string) =>
    void queryClient.invalidateQueries({ queryKey: ["admin", key, areaId] });

  const saveConfig = useMutation({
    mutationFn: async () => {
      await api.post(
        `/api/pricing/fare-config?serviceAreaId=${areaId}`,
        {
          baseFare: Number(configForm.baseFare),
          perKmRate: Number(configForm.perKmRate),
          platformFee: Number(configForm.platformFee),
        }
      );
    },
    onSuccess: () => {
      toast("success", "Fare configuration saved");
      invalidate("fare-config");
    },
    onError: () => toast("error", "Failed to save fare configuration"),
  });

  const addRule = useMutation({
    mutationFn: async (payload: { minDistanceKm: number; maxDistanceKm: number; fee: number }) => {
      await api.post(`/api/pricing/pickup-rules?serviceAreaId=${areaId}`, payload);
    },
    onSuccess: () => {
      toast("success", "Pickup rule added");
      setRuleForm(emptyRule);
      setRuleError("");
      invalidate("pickup-rules");
    },
    onError: () => toast("error", "Failed to add pickup rule"),
  });

  const removeRule = useMutation({
    mutationFn: async (ruleId: string) => {
      await api.delete(`/api/pricing/pickup-rules/${ruleId}`);
    },
    onSuccess: () => {
      toast("success", "Pickup rule removed");
      invalidate("pickup-rules");
    },
    onError: () => toast("error", "Failed to remove pickup rule"),
  });

  const submitRule = (e: React.FormEvent) => {
    e.preventDefault();
    const min = Number(ruleForm.minDistanceKm);
    const max = Number(ruleForm.maxDistanceKm);
    const fee = Number(ruleForm.fee);
    if (Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(fee)) {
      setRuleError("All fields must be numbers.");
      return;
    }
    if (max < min) {
      setRuleError("Max distance must be greater than or equal to min distance.");
      return;
    }
    addRule.mutate({ minDistanceKm: min, maxDistanceKm: max, fee });
  };

  const previewFares = [3, 5, 10, 20].map((km) => {
    const base = Number(configForm.baseFare) || 0;
    const rate = Number(configForm.perKmRate) || 0;
    const trip = base + km * rate;
    const commission = (trip * (Number(configForm.platformFee) || 0)) / 100;
    return { km, trip, commission, driverEarnings: trip - commission };
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Fare Management" description="Configure pricing and pickup fee rules per service area" />

      {(areas ?? []).length > 0 ? (
        <SegmentedControl
          options={(areas ?? []).map((a) => ({ value: a.id, label: a.name }))}
          value={areaId}
          onChange={setAreaId}
        />
      ) : (
        !areas && <Skeleton className="h-10 w-full max-w-xl rounded-xl" />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Base fare configuration */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
            <Banknote size={18} className="text-primary-600" />
            Base Fare Configuration
          </h2>

          {configLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : configError ? (
            <ErrorState message="Could not load fare configuration." onRetry={() => invalidate("fare-config")} />
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveConfig.mutate();
              }}
            >
              {(
                [
                  { key: "baseFare" as const, label: "Base Fare (₱)" },
                  { key: "perKmRate" as const, label: "Per-Kilometer Rate (₱)" },
                  { key: "platformFee" as const, label: "Platform Fee (₱ flat)" },
                ]
              ).map((field) => (
                <div key={field.key}>
                  <label htmlFor={`fare-${field.key}`} className="mb-1.5 block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    id={`fare-${field.key}`}
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={configForm[field.key]}
                    onChange={(e) => setConfigForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={config ? undefined : "Not configured yet"}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              ))}
              {!config && (
                <p className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
                  No active fare configuration for this area yet — saving will create one.
                </p>
              )}
              <Button type="submit" loading={saveConfig.isPending}>
                <Save size={15} />
                Save Configuration
              </Button>
            </form>
          )}
        </section>

        {/* Live fare preview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-5 text-base font-bold text-slate-900">Fare Preview</h2>
          <div className="space-y-3">
            {previewFares.map((p) => (
              <div key={p.km} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{p.km} km trip</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(p.trip)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Platform: {formatCurrency(p.commission)} · Driver: {formatCurrency(p.driverEarnings)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Pickup fee rules */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="mb-1 text-base font-bold text-slate-900">Pickup Fee Rules</h2>
        <p className="mb-5 text-xs text-slate-400">
          Charged based on the driver's distance to the passenger. The first matching range applies.
        </p>

        {rulesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : (rules ?? []).length === 0 ? (
          <EmptyState
            illustration="wallet"
            title="No pickup rules"
            description="Add distance-based rules to charge pickup fees."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {(rules ?? []).map((rule) => (
              <li key={rule.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {Number(rule.minDistanceKm)} – {Number(rule.maxDistanceKm)} km
                  </p>
                  <p className="text-xs text-slate-400">Driver-to-passenger distance</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary-700">{formatCurrency(rule.fee)}</span>
                  <button
                    onClick={() => removeRule.mutate(rule.id)}
                    disabled={removeRule.isPending}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                    aria-label="Remove rule"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add rule form */}
        <form onSubmit={submitRule} className="mt-5 border-t border-slate-100 pt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <div>
              <label htmlFor="rule-min" className="mb-1 block text-xs font-medium text-slate-500">
                Min Distance (km)
              </label>
              <input
                id="rule-min"
                type="number"
                min={0}
                step="0.1"
                required
                value={ruleForm.minDistanceKm}
                onChange={(e) => setRuleForm((f) => ({ ...f, minDistanceKm: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="rule-max" className="mb-1 block text-xs font-medium text-slate-500">
                Max Distance (km)
              </label>
              <input
                id="rule-max"
                type="number"
                min={0}
                step="0.1"
                required
                value={ruleForm.maxDistanceKm}
                onChange={(e) => setRuleForm((f) => ({ ...f, maxDistanceKm: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="rule-fee" className="mb-1 block text-xs font-medium text-slate-500">
                Fee (₱)
              </label>
              <input
                id="rule-fee"
                type="number"
                min={0}
                step="0.01"
                required
                value={ruleForm.fee}
                onChange={(e) => setRuleForm((f) => ({ ...f, fee: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="secondary" loading={addRule.isPending} className="w-full sm:w-auto">
                <Plus size={15} />
                Add
              </Button>
            </div>
          </div>
          {ruleError && <p className="mt-2 text-xs text-danger-600">{ruleError}</p>}
        </form>
      </section>
    </div>
  );
}
