type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

const variants: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-primary-50 text-primary-700 ring-primary-600/20",
  neutral: "bg-slate-50 text-slate-600 ring-slate-500/20",
  purple: "bg-purple-50 text-purple-700 ring-purple-600/20",
};

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  active: "success",
  completed: "success",
  verified: "success",
  approved: "success",
  enabled: "success",
  pending: "warning",
  pending_verification: "warning",
  processing: "info",
  in_progress: "info",
  cancelled: "danger",
  rejected: "danger",
  deactivated: "danger",
  disabled: "danger",
  failed: "danger",
  expired: "neutral",
  inactive: "neutral",
};

export function getStatusVariant(status: string): BadgeVariant {
  return statusVariantMap[status.toLowerCase()] || "neutral";
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const v = variant || "neutral";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[v]}`}
    >
      {label}
    </span>
  );
}
