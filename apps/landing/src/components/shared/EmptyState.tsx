import type { ReactNode } from "react";

type Illustration = "trips" | "notifications" | "search" | "wallet" | "generic";

function IllustrationSvg({ kind }: { kind: Illustration }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 120 96" className="h-24 w-30 text-primary-200" aria-hidden>
      {/* backdrop blob */}
      <circle cx="60" cy="48" r="40" className="fill-primary-50" />
      {kind === "trips" && (
        <g {...common} className="text-primary-400">
          <path d="M28 62h64" />
          <path d="M38 62V46a6 6 0 016-6h32a6 6 0 016 6v16" />
          <path d="M34 70a4 4 0 108 0M78 70a4 4 0 108 0" />
          <path d="M44 52h10M66 52h10" className="text-primary-300" />
        </g>
      )}
      {kind === "notifications" && (
        <g {...common} className="text-primary-400">
          <path d="M60 26a14 14 0 0114 14v10l5 8H41l5-8V40a14 14 0 0114-14z" />
          <path d="M54 62a6 6 0 0012 0" />
          <path d="M84 30a8 8 0 100 12" className="text-primary-300" />
        </g>
      )}
      {kind === "search" && (
        <g {...common} className="text-primary-400">
          <circle cx="55" cy="45" r="16" />
          <path d="M67 57l12 12" />
          <path d="M49 45h12M55 39v12" className="text-primary-300" />
        </g>
      )}
      {kind === "wallet" && (
        <g {...common} className="text-primary-400">
          <rect x="32" y="34" width="56" height="36" rx="6" />
          <path d="M76 48h12v10H76a5 5 0 010-10z" />
          <path d="M42 42h20" className="text-primary-300" />
        </g>
      )}
      {kind === "generic" && (
        <g {...common} className="text-primary-400">
          <rect x="36" y="30" width="48" height="40" rx="8" />
          <path d="M48 44h24M48 54h16" className="text-primary-300" />
        </g>
      )}
    </svg>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  illustration?: Illustration;
  action?: ReactNode;
}

export default function EmptyState({ title, description, illustration = "generic", action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
      <IllustrationSvg kind={illustration} />
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
