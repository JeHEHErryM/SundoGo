import { BarChart3, TrendingUp, Users, MapPin } from "lucide-react";

const tripStats = [
  { period: "Mon", trips: 142, earnings: 85200 },
  { period: "Tue", trips: 168, earnings: 100800 },
  { period: "Wed", trips: 155, earnings: 93000 },
  { period: "Thu", trips: 189, earnings: 113400 },
  { period: "Fri", trips: 234, earnings: 140400 },
  { period: "Sat", trips: 278, earnings: 166800 },
  { period: "Sun", trips: 195, earnings: 117000 },
];

const topDrivers = [
  { name: "James Mwangi", trips: 89, earnings: 67200, rating: 4.8 },
  { name: "Grace Wanjiku", trips: 76, earnings: 58400, rating: 4.9 },
  { name: "Alice Njeri", trips: 72, earnings: 54100, rating: 4.7 },
  { name: "Sarah Otieno", trips: 68, earnings: 51200, rating: 4.6 },
  { name: "Mary Akinyi", trips: 64, earnings: 48900, rating: 4.4 },
];

const demandHotspots = [
  { area: "Westlands", demand: 92, trend: "up" },
  { area: "CBD", demand: 85, trend: "up" },
  { area: "Karen", demand: 68, trend: "stable" },
  { area: "Kiambu Road", demand: 64, trend: "down" },
  { area: "Langata", demand: 57, trend: "stable" },
];

function BarChartSimple({ data }: { data: typeof tripStats }) {
  const max = Math.max(...data.map((d) => d.trips));
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => (
        <div key={d.period} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-slate-600">{d.trips}</span>
          <div
            className="w-full bg-primary-500 rounded-t-md transition-all hover:bg-primary-600"
            style={{ height: `${(d.trips / max) * 100}%` }}
          />
          <span className="text-xs text-slate-400">{d.period}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const totalTrips = tripStats.reduce((s, d) => s + d.trips, 0);
  const totalEarnings = tripStats.reduce((s, d) => s + d.earnings, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Platform analytics and performance insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: "Total Trips (7d)", value: totalTrips.toLocaleString() },
          { icon: TrendingUp, label: "Total Earnings (7d)", value: `KES ${totalEarnings.toLocaleString()}` },
          { icon: Users, label: "Active Drivers (7d)", value: "87" },
          { icon: MapPin, label: "Service Areas Active", value: "6 / 8" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="p-2.5 rounded-lg bg-primary-50 w-fit">
              <card.icon size={18} className="text-primary-600" />
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Statistics Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Weekly Trip Volume</h2>
          <BarChartSimple data={tripStats} />
        </div>

        {/* Earnings Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Weekly Earnings (KES)</h2>
          <div className="flex items-end gap-2 h-40">
            {tripStats.map((d) => {
              const max = Math.max(...tripStats.map((x) => x.earnings));
              return (
                <div key={d.period} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-slate-600">
                    {(d.earnings / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-600"
                    style={{ height: `${(d.earnings / max) * 100}%` }}
                  />
                  <span className="text-xs text-slate-400">{d.period}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Drivers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Drivers</h2>
          <div className="space-y-3">
            {topDrivers.map((driver, i) => (
              <div key={driver.name} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{driver.name}</p>
                  <p className="text-xs text-slate-400">
                    {driver.trips} trips · KES {driver.earnings.toLocaleString()} · {driver.rating} ★
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Hotspots */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Demand Hotspots</h2>
          <div className="space-y-3">
            {demandHotspots.map((spot) => (
              <div key={spot.area} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <MapPin size={16} className="text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{spot.area}</span>
                    <span className="text-sm font-medium text-slate-700">{spot.demand}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${spot.demand}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
