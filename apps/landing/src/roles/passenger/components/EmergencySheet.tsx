import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Phone, MessageSquare, X, Loader2, CheckCircle2, Siren } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface EmergencyAlertResult {
  contacts: EmergencyContact[];
  bookingId: string | null;
  driverNotified: boolean;
}

interface EmergencySheetProps {
  open: boolean;
  onClose: () => void;
}

export default function EmergencySheet({ open, onClose }: EmergencySheetProps) {
  const [message, setMessage] = useState("");
  const [alertSent, setAlertSent] = useState(false);

  const contactsQuery = useQuery({
    queryKey: ["passenger", "emergency-contacts"],
    enabled: open,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<EmergencyContact[]>>("/api/passengers/emergency-contacts");
      return data.data ?? [];
    },
  });

  const alertMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<EmergencyAlertResult>>(
        "/api/passengers/emergency-alert",
        { message: message.trim() || undefined },
      );
      return data.data!;
    },
    onSuccess: () => setAlertSent(true),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />

        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
              <Siren size={22} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Emergency Assistance</h2>
              <p className="text-xs text-slate-500">Alerts your driver and emergency contacts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {alertSent ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={16} />
              {alertMutation.data?.driverNotified
                ? "Your driver has been notified."
                : "Alert recorded. Share your location with a contact below."}
            </div>

            <a
              href="tel:911"
              className="press flex items-center gap-3 rounded-2xl bg-red-600 p-4 text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 active:scale-[0.98]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Phone size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">Call 911</p>
                <p className="text-xs text-red-100">National emergency hotline</p>
              </div>
            </a>

            <div>
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Emergency Contacts
              </h3>
              {(alertMutation.data?.contacts ?? contactsQuery.data ?? []).length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No emergency contacts saved. Add them in your Profile page.
                </p>
              ) : (
                <div className="space-y-2">
                  {(alertMutation.data?.contacts ?? contactsQuery.data ?? []).map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{contact.name}</p>
                        <p className="text-xs text-slate-400">
                          {contact.relationship} • {contact.phone}
                        </p>
                      </div>
                      <a
                        href={`sms:${contact.phone}?body=${encodeURIComponent(
                          `EMERGENCY! I need help with my SundoGo trip. ${message.trim()}`.trim(),
                        )}`}
                        aria-label={`Text ${contact.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100"
                      >
                        <MessageSquare size={17} />
                      </a>
                      <a
                        href={`tel:${contact.phone}`}
                        aria-label={`Call ${contact.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Phone size={17} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <p>
                Your driver will be alerted immediately with your trip details. Use this only in a real
                emergency.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                What&apos;s happening? <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="e.g. Feeling unsafe, driver took a wrong turn..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm placeholder:text-slate-400 focus:border-red-400 focus:bg-white outline-none"
              />
            </div>

            {alertMutation.isError && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                Could not send the alert. Check your connection and try again.
              </p>
            )}

            <button
              onClick={() => alertMutation.mutate()}
              disabled={alertMutation.isPending}
              className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
            >
              {alertMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Siren size={20} />
                  Send Emergency Alert
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-slate-100 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
