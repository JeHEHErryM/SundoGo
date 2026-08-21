import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Link2, Loader2, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse, DriverVerificationStatus } from "@sundogo/types";

interface VerificationData {
  id: string;
  status: DriverVerificationStatus;
  notes?: string | null;
  idDocumentUrl: string;
  licenseUrl: string;
  vehicleRegistrationUrl: string;
}

const emptyForm = { idDocumentUrl: "", licenseUrl: "", vehicleRegistrationUrl: "" };

export default function VerificationStatusPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState(emptyForm);

  const { data: verification, isLoading } = useQuery({
    queryKey: ["driver", "verification"],
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<VerificationData>>("/api/driver-verification/status");
        return data.data;
      } catch {
        return null; // not submitted yet
      }
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/driver-verification/submit", {
        idDocumentUrl: form.idDocumentUrl,
        licenseUrl: form.licenseUrl,
        vehicleRegistrationUrl: form.vehicleRegistrationUrl,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["driver", "verification"] });
      setForm(emptyForm);
    },
  });

  const status = verification?.status ?? user?.verificationStatus ?? "PENDING";

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string; desc: string }> = {
    PENDING: {
      icon: <Clock className="h-8 w-8" />,
      color: "text-amber-600 bg-amber-50",
      label: verification ? "Verification Pending" : "Not Yet Submitted",
      desc: verification
        ? "Your documents are being reviewed. This usually takes 24–48 hours."
        : "Submit your documents below to get verified and start accepting bookings.",
    },
    APPROVED: {
      icon: <CheckCircle2 className="h-8 w-8" />,
      color: "text-success-600 bg-success-50",
      label: "Verified",
      desc: "Your account is fully verified. You can accept bookings now.",
    },
    REJECTED: {
      icon: <XCircle className="h-8 w-8" />,
      color: "text-danger-600 bg-danger-50",
      label: "Verification Rejected",
      desc: `Reason: ${verification?.notes ?? "Please re-submit your documents."}`,
    },
  };

  const cfg = statusConfig[status]!;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pb-16 pt-10 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary-400" />
          <h1 className="text-xl font-bold">Verification</h1>
        </div>
      </div>

      <div className="safe-area-pb mx-auto -mt-8 max-w-lg space-y-4 px-4 pb-6">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        ) : (
          <div className={`rounded-2xl p-5 ${cfg.color}`}>
            <div className="flex items-center gap-3">
              {cfg.icon}
              <div>
                <p className="text-lg font-bold">{cfg.label}</p>
                <p className="text-sm opacity-80">{cfg.desc}</p>
              </div>
            </div>
          </div>
        )}

        {/* Previously submitted documents */}
        {verification && status !== "APPROVED" && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Submitted Documents
            </h2>
            <ul className="space-y-2">
              {(
                [
                  { label: "Government ID", url: verification.idDocumentUrl },
                  { label: "Driver's License", url: verification.licenseUrl },
                  { label: "Vehicle Registration", url: verification.vehicleRegistrationUrl },
                ] as const
              ).map((doc) => (
                <li key={doc.label}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm transition-colors hover:border-primary-300 hover:bg-primary-50/50"
                  >
                    <span className="font-medium text-gray-700">{doc.label}</span>
                    <ExternalLink size={14} className="text-primary-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(status === "PENDING" || status === "REJECTED") && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-base font-semibold text-gray-800">
              {verification ? "Re-submit Documents" : "Submit Documents"}
            </h2>
            <p className="mb-4 text-xs text-gray-400">
              Paste shareable links to your documents (Google Drive, Imgur, etc.). Make sure they're viewable.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitMutation.mutate();
              }}
              className="space-y-4"
            >
              <UrlInput
                label="Valid Government ID"
                value={form.idDocumentUrl}
                onChange={(v) => setForm((p) => ({ ...p, idDocumentUrl: v }))}
              />
              <UrlInput
                label="Driver's License"
                value={form.licenseUrl}
                onChange={(v) => setForm((p) => ({ ...p, licenseUrl: v }))}
              />
              <UrlInput
                label="OR/CR of Vehicle"
                value={form.vehicleRegistrationUrl}
                onChange={(v) => setForm((p) => ({ ...p, vehicleRegistrationUrl: v }))}
              />

              <button
                type="submit"
                disabled={
                  submitMutation.isPending ||
                  !form.idDocumentUrl ||
                  !form.licenseUrl ||
                  !form.vehicleRegistrationUrl
                }
                className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-700 disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Link2 className="h-5 w-5" /> Submit Documents
                  </>
                )}
              </button>

              {submitMutation.isSuccess && (
                <p className="text-center text-sm font-medium text-success-600">Documents submitted successfully!</p>
              )}
              {submitMutation.isError && (
                <p className="text-center text-sm font-medium text-danger-600">
                  Submission failed — check that all links are valid URLs.
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function UrlInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      <input
        type="url"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…"
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-300 focus:border-primary-500 focus:bg-white focus:outline-none"
      />
    </div>
  );
}
