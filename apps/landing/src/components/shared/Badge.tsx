type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

const variants: Record<Variant, string> = {
  success: "bg-success-50 text-success-700 ring-success-600/20",
  warning: "bg-warning-50 text-warning-700 ring-warning-600/20",
  danger: "bg-danger-50 text-danger-700 ring-danger-600/20",
  info: "bg-info-50 text-info-700 ring-info-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
  purple: "bg-purple-50 text-purple-700 ring-purple-600/20",
};

const dotVariants: Record<Variant, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
  neutral: "bg-slate-400",
  purple: "bg-purple-500",
};

const statusVariantMap: Record<string, Variant> = {
  active: "success",
  completed: "success",
  verified: "success",
  approved: "success",
  enabled: "success",
  paid: "success",
  online: "success",
  pending: "warning",
  pending_verification: "warning",
  searching: "warning",
  requested: "warning",
  processing: "info",
  in_progress: "info",
  driver_arriving: "info",
  driver_arrived: "info",
  accepted: "info",
  on_trip: "info",
  cancelled: "danger",
  rejected: "danger",
  deactivated: "danger",
  disabled: "neutral",
  failed: "danger",
  offline: "neutral",
  expired: "neutral",
  inactive: "neutral",
};

export function getStatusVariant(status: string): Variant {
  return statusVariantMap[status.toLowerCase()] ?? "neutral";
}

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BadgeProps {
  label: string;
  variant?: Variant;
  dot?: boolean;
  size?: "sm" | "md";
}

export default function Badge({ label, variant, dot = true, size = "md" }: BadgeProps) {
  const v = variant ?? getStatusVariant(label);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs"
      } ${variants[v]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotVariants[v]}`} />}
      {formatStatusLabel(label)}
    </span>
  );
}
