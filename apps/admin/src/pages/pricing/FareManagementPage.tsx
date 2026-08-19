import { useState } from "react";
import { Save, DollarSign } from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";

interface PickupRule {
  id: string;
  name: string;
  condition: string;
  fee: number;
  [key: string]: unknown;
}

const defaultRules: PickupRule[] = [
  { id: "PR001", name: "Airport Pickup", condition: "Pickup at JKIA", fee: 200 },
  { id: "PR002", name: "Mall Pickup", condition: "Pickup at major mall", fee: 50 },
  { id: "PR003", name: "Night Surcharge", condition: "10 PM – 5 AM", fee: 150 },
  { id: "PR004", name: "Peak Hour", condition: "7 AM – 9 AM, 5 PM – 7 PM", fee: 75 },
  { id: "PR005", name: "Long Distance", condition: "Destination > 30 km", fee: 100 },
];

const ruleColumns: Column<PickupRule>[] = [
  { key: "name", label: "Rule Name", sortable: true },
  { key: "condition", label: "Condition" },
  {
    key: "fee",
    label: "Fee (KES)",
    sortable: true,
    render: (row) => <span className="font-medium">KES {Number(row.fee).toLocaleString()}</span>,
  },
];

export default function FareManagementPage() {
  const [baseFare, setBaseFare] = useState("150");
  const [perKm, setPerKm] = useState("65");
  const [platformFee, setPlatformFee] = useState("15");
  const [minFare, setMinFare] = useState("200");
  const [rules] = useState(defaultRules);

  const handleSave = () => {
    console.log("Saving fare config:", { baseFare, perKm, platformFee, minFare, rules });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fare Management</h1>
          <p className="text-sm text-slate-500">Configure pricing and fare rules</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Fare Config */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <DollarSign size={18} />
            Base Fare Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Base Fare (KES)
              </label>
              <input
                type="number"
                value={baseFare}
                onChange={(e) => setBaseFare(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Per-Kilometer Rate (KES)
              </label>
              <input
                type="number"
                value={perKm}
                onChange={(e) => setPerKm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Platform Fee (%)
              </label>
              <input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Minimum Fare (KES)
              </label>
              <input
                type="number"
                value={minFare}
                onChange={(e) => setMinFare(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Fare Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Fare Preview</h2>
          <div className="space-y-4">
            {[
              { distance: 5, label: "5 km trip" },
              { distance: 10, label: "10 km trip" },
              { distance: 20, label: "20 km trip" },
              { distance: 35, label: "35 km trip" },
            ].map((preview) => {
              const fare = Math.max(
                Number(minFare) || 200,
                (Number(baseFare) || 150) + preview.distance * (Number(perKm) || 65)
              );
              const platformAmount = Math.round(fare * ((Number(platformFee) || 15) / 100));
              return (
                <div key={preview.distance} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{preview.label}</span>
                    <span className="text-sm font-bold text-slate-900">KES {fare.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Platform commission: KES {platformAmount.toLocaleString()} · Driver earnings: KES {(fare - platformAmount).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pickup Fee Rules */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Pickup Fee Rules</h2>
        <DataTable columns={ruleColumns} data={rules} />
      </div>
    </div>
  );
}
