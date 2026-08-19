import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShieldCheck, Upload, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse, DriverVerificationStatus } from "@sundogo/types";

interface VerificationData {
  status: DriverVerificationStatus;
  notes?: string;
}

export default function VerificationStatusPage() {
  const user = useAuthStore((s) => s.user);
  const [files, setFiles] = useState({ idImage: null as File | null, licenseImage: null as File | null, orcrImage: null as File | null });

  const { data: verification } = useQuery({
    queryKey: ["verification"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<VerificationData>>("/api/driver/verification");
      return data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      if (files.idImage) fd.append("idImage", files.idImage);
      if (files.licenseImage) fd.append("licenseImage", files.licenseImage);
      if (files.orcrImage) fd.append("orcrImage", files.orcrImage);
      await api.post("/api/driver/verification", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
  });

  const status = verification?.status ?? user?.verificationStatus ?? "PENDING";

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string; desc: string }> = {
    PENDING: {
      icon: <Clock className="h-8 w-8" />,
      color: "text-amber-500 bg-amber-50",
      label: "Verification Pending",
      desc: "Your documents are being reviewed. This usually takes 24-48 hours.",
    },
    APPROVED: {
      icon: <CheckCircle2 className="h-8 w-8" />,
      color: "text-success-500 bg-success-50",
      label: "Verified",
      desc: "Your account is fully verified. You can accept bookings now.",
    },
    REJECTED: {
      icon: <XCircle className="h-8 w-8" />,
      color: "text-danger-500 bg-danger-50",
      label: "Verification Rejected",
      desc: `Reason: ${verification?.notes ?? "Please re-upload your documents."}`,
    },
  };

  const cfg = statusConfig[status]!;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pt-12 pb-16 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary-400" />
          <h1 className="text-xl font-bold">Verification</h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg -mt-8 space-y-4 px-4 pb-6">
        <div className={`rounded-2xl p-5 ${cfg.color}`}>
          <div className="flex items-center gap-3">
            {cfg.icon}
            <div>
              <p className="text-lg font-bold">{cfg.label}</p>
              <p className="text-sm opacity-80">{cfg.desc}</p>
            </div>
          </div>
        </div>

        {(status === "PENDING" || status === "REJECTED") && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Upload Documents</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                uploadMutation.mutate();
              }}
              className="space-y-4"
            >
              <FileInput label="Valid Government ID" onChange={(f) => setFiles((p) => ({ ...p, idImage: f }))} />
              <FileInput label="Driver's License" onChange={(f) => setFiles((p) => ({ ...p, licenseImage: f }))} />
              <FileInput label="OR/CR of Vehicle" onChange={(f) => setFiles((p) => ({ ...p, orcrImage: f }))} />

              <button
                type="submit"
                disabled={uploadMutation.isPending || (!files.idImage && !files.licenseImage && !files.orcrImage)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-700 disabled:opacity-50"
              >
                {uploadMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /> Submit Documents</>}
              </button>

              {uploadMutation.isSuccess && (
                <p className="text-center text-sm font-medium text-success-600">Documents submitted successfully!</p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function FileInput({ label, onChange }: { label: string; onChange: (f: File) => void }) {
  const [name, setName] = useState("");
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:border-primary-400 hover:bg-primary-50">
        <Upload className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-500">{name || "Choose file"}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setName(f.name);
              onChange(f);
            }
          }}
        />
      </label>
    </div>
  );
}
