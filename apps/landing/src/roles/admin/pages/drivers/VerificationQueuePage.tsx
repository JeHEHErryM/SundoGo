import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import Sheet from "@/components/shared/Sheet";
import Avatar from "@/components/shared/Avatar";
import { Skeleton } from "@/components/shared/Skeleton";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import { useToast } from "@/components/shared";
import { formatDate, fullName } from "@/components/shared";

interface PendingVerification {
  id: string;
  driverId: string;
  idImageUrl: string;
  licenseImageUrl: string;
  orcrImageUrl: string;
  createdAt: string;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl?: string;
    user: { email: string };
  };
}

const documentFields = [
  { key: "idImageUrl" as const, label: "National ID" },
  { key: "licenseImageUrl" as const, label: "Driver's License" },
  { key: "orcrImageUrl" as const, label: "OR / CR" },
];

export default function VerificationQueuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState<PendingVerification | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const { data: pending, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "verification-pending"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PendingVerification[]>>("/api/driver-verification/pending");
      return data.data ?? [];
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "verification-pending"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const approve = useMutation({
    mutationFn: async (verificationId: string) => {
      await api.patch(`/api/driver-verification/${verificationId}/approve`);
    },
    onSuccess: (_data, verificationId) => {
      toast("success", "Driver approved");
      setSelected((prev) => (prev?.id === verificationId ? null : prev));
      invalidate();
    },
    onError: () => toast("error", "Failed to approve"),
  });

  const reject = useMutation({
    mutationFn: async ({ verificationId, notes }: { verificationId: string; notes: string }) => {
      await api.patch(`/api/driver-verification/${verificationId}/reject`, { notes });
    },
    onSuccess: () => {
      toast("success", "Verification rejected");
      setRejectOpen(false);
      setRejectNotes("");
      setSelected(null);
      invalidate();
    },
    onError: () => toast("error", "Failed to reject"),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Verification Queue"
        description={
          isLoading
            ? "Loading pending submissions…"
            : `${pending?.length ?? 0} driver${pending?.length !== 1 ? "s" : ""} awaiting review`
        }
      />

      {isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <ErrorState message="Could not load the verification queue." onRetry={() => refetch()} />
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (pending ?? []).length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            illustration="notifications"
            title="Queue is clear"
            description="No drivers are waiting for verification right now."
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {(pending ?? []).map((v) => (
            <li
              key={v.id}
              className={`rounded-2xl border bg-white p-4 shadow-xs transition-all sm:p-5 ${
                selected?.id === v.id ? "border-primary-300 ring-2 ring-primary-100" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <button
                  onClick={() => setSelected(selected?.id === v.id ? null : v)}
                  className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                >
                  <Avatar name={fullName(v.driver)} src={v.driver?.avatarUrl} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{fullName(v.driver)}</p>
                    <p className="truncate text-xs text-slate-400">{v.driver?.user.email}</p>
                    <p className="mt-0.5 text-xs text-slate-400">Submitted {formatDate(v.createdAt)}</p>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/user/admin/drivers/${v.driverId}`)}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    loading={approve.isPending && approve.variables === v.id}
                    onClick={() => approve.mutate(v.id)}
                  >
                    <CheckCircle size={14} />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelected(v);
                      setRejectOpen(true);
                    }}
                  >
                    <XCircle size={14} />
                    Reject
                  </Button>
                </div>
              </div>

              {/* Document previews */}
              {selected?.id === v.id && (
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3 animate-fade-in">
                  {documentFields.map((field) => (
                    <a
                      key={field.key}
                      href={v[field.key]}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-primary-300 hover:bg-primary-50/50"
                    >
                      <FileText size={22} className="shrink-0 text-slate-400 group-hover:text-primary-600" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{field.label}</p>
                        <p className="text-xs text-primary-600">Click to view</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Reject modal */}
      <Sheet open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Verification">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Reject the verification for{" "}
            <strong>{selected ? fullName(selected.driver) : "this driver"}</strong>?
          </p>
          <div>
            <label htmlFor="reject-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason / Notes
            </label>
            <textarea
              id="reject-notes"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              placeholder="Explain why this verification is being rejected…"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!rejectNotes.trim()}
              loading={reject.isPending}
              onClick={() =>
                selected &&
                reject.mutate({ verificationId: selected.id, notes: rejectNotes.trim() })
              }
            >
              Reject
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
