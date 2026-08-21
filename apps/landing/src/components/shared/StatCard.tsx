import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCountUp } from "./useCountUp";

type Accent = "primary" | "info" | "warning" | "danger" | "purple";

const accents: Record<Accent, { iconBg: string; iconColor: string }> = {
  primary: { iconBg: "bg-primary-50", iconColor: "text-primary-600" },
  info: { iconBg: "bg-info-50", iconColor: "text-info-600" },
  warning: { iconBg: "bg-warning-50", iconColor: "text-warning-600" },
  danger: { iconBg: "bg-danger-50", iconColor: "text-danger-600" },
  purple: { iconBg: "bg-purple-50", iconColor: "text-purple-600" },
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  accent?: Accent;
  /** Animate numeric values counting up */
  animated?: boolean;
}

export default function StatCard({ icon: Icon, label, value, trend, accent = "primary", animated }: StatCardProps) {
  const a = accents[accent];
  const numeric = typeof value === "number" ? value : undefined;
  const counted = useCountUp(numeric ?? 0);
  const display =
    numeric !== undefined && animated
      ? Number.isInteger(numeric)
        ? Math.round(counted).toLocaleString()
        : counted.toFixed(1)
      : value;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${a.iconBg}`}>
          <Icon size={20} className={`${a.iconColor} transition-transform group-hover:scale-110`} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend.value >= 0 ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-600"
            }`}
          >
            {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{display}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      {trend && <p className="mt-0.5 text-xs text-slate-400">{trend.label}</p>}
    </div>
  );
}
