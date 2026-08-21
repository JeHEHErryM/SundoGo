import {
  ClipboardList,
  Car,
  Users,
  ShieldCheck,
  CheckCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";

const stats = [
  { icon: ClipboardList, label: "Active Bookings", value: "24", trend: { value: 12, label: "vs last week" } },
  { icon: Car, label: "Active Trips", value: "18", trend: { value: 8, label: "vs last week" } },
  { icon: Users, label: "Total Passengers", value: "1,284", trend: { value: 5, label: "vs last month" } },
  { icon: Car, label: "Total Drivers", value: "342", trend: { value: 3, label: "vs last month" } },
  { icon: ShieldCheck, label: "Pending Verifications", value: "7", trend: { value: -2, label: "vs last week" } },
  { icon: CheckCircle, label: "Completed Trips", value: "8,921", trend: { value: 15, label: "vs last month" } },
  { icon: DollarSign, label: "Platform Fees", value: "$42,850", trend: { value: 11, label: "vs last month" } },
];

const recentActivity = [
  { id: 1, text: "New driver John D. submitted verification documents", time: "5 min ago", type: "info" },
  { id: 2, text: "Booking #4821 completed successfully", time: "12 min ago", type: "success" },
  { id: 3, text: "Driver Sarah M. completed 50th trip", time: "1 hour ago", type: "success" },
  { id: 4, text: "New passenger registration: Mike R.", time: "2 hours ago", type: "info" },
  { id: 5, text: "Service area 'Downtown Core' enabled", time: "3 hours ago", type: "info" },
  { id: 6, text: "Fare adjustment applied: base rate updated", time: "5 hours ago", type: "warning" },
];

const quickActions = [
  { label: "Review Verifications", path: "/user/admin/drivers/verification", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
  { label: "View Bookings", path: "/user/admin/bookings", color: "bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100" },
  { label: "Manage Fares", path: "/user/admin/pricing", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
  { label: "View Reports", path: "/user/admin/reports", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    item.type === "success"
                      ? "bg-emerald-500"
                      : item.type === "warning"
                      ? "bg-amber-500"
                      : "bg-primary-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${action.color}`}
              >
                {action.label}
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
