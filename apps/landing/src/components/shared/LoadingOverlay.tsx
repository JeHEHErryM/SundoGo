interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export default function LoadingOverlay({
  show,
  message = "Loading, please wait ...",
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="mx-4 flex w-full max-w-xs flex-col items-center rounded-3xl bg-white px-8 py-10 shadow-2xl">
        <img src="/SundoGo_Logo.svg" alt="" className="h-14 w-auto" />
        <div
          className="mt-6 h-9 w-9 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600"
          aria-hidden
        />
        <p className="mt-5 text-sm font-medium text-slate-600">{message}</p>
      </div>
    </div>
  );
}
