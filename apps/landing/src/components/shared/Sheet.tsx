import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Responsive modal: bottom sheet on mobile (travel-app pattern),
 * centered dialog on desktop.
 */
export default function Sheet({ open, onClose, title, children }: SheetProps) {
  const [render, setRender] = useState(open);
  const closingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      document.body.style.overflow = "hidden";
    } else if (render) {
      closingRef.current = true;
      const t = window.setTimeout(() => {
        setRender(false);
        closingRef.current = false;
        document.body.style.overflow = "";
      }, 200);
      return () => window.clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!render) return null;

  return (
    <div className="fixed inset-0 z-[90] sm:flex sm:items-center sm:justify-center sm:p-4">
      <div
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] ${open ? "animate-fade-in" : "opacity-0 transition-opacity duration-200"}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white shadow-xl safe-area-pb sm:relative sm:max-w-lg sm:rounded-3xl ${
          open ? "animate-slide-up sm:animate-scale-in" : "translate-y-full transition-transform duration-200 sm:translate-y-0"
        }`}
      >
        {/* drag handle (mobile) */}
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        {title && (
          <div className="flex items-center justify-between px-5 pb-2 pt-3 sm:px-6">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="press flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 pb-6 pt-2 sm:px-6 sm:pb-6">{children}</div>
      </div>
    </div>
  );
}
