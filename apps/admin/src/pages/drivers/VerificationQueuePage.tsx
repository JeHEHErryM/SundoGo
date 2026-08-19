import { useState } from "react";
import { CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";
import Modal from "@/components/Modal";

interface Verification {
  id: string;
  driverName: string;
  email: string;
  phone: string;
  submittedDate: string;
  documents: { type: string; file: string }[];
  [key: string]: unknown;
}

const pendingVerifications: Verification[] = [
  { id: "V001", driverName: "Peter Kamau", email: "peter@email.com", phone: "+254700100300", submittedDate: "2026-08-18", documents: [{ type: "Driver's License", file: "license.pdf" }, { type: "Vehicle Registration", file: "reg.pdf" }] },
  { id: "V002", driverName: "Robert Kiprop", email: "robert@email.com", phone: "+254700100700", submittedDate: "2026-08-17", documents: [{ type: "Driver's License", file: "license.pdf" }, { type: "National ID", file: "id.pdf" }] },
  { id: "V003", driverName: "Lucy Wambui", email: "lucy@email.com", phone: "+254700100900", submittedDate: "2026-08-17", documents: [{ type: "Driver's License", file: "license.pdf" }, { type: "Insurance Certificate", file: "insurance.pdf" }] },
  { id: "V004", driverName: "Tom Odhiambo", email: "tom@email.com", phone: "+254700101000", submittedDate: "2026-08-16", documents: [{ type: "National ID", file: "id.pdf" }, { type: "Vehicle Registration", file: "reg.pdf" }] },
  { id: "V005", driverName: "Nancy Achieng", email: "nancy@email.com", phone: "+254700101100", submittedDate: "2026-08-16", documents: [{ type: "Driver's License", file: "license.pdf" }] },
];

const columns: Column<Verification>[] = [
  { key: "driverName", label: "Driver Name", sortable: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "submittedDate", label: "Submitted", sortable: true },
  {
    key: "documents",
    label: "Documents",
    render: (row) => (
      <span className="text-slate-600">{(row.documents as Verification["documents"]).length} files</span>
    ),
  },
];

export default function VerificationQueuePage() {
  const [selected, setSelected] = useState<Verification | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification Queue</h1>
        <p className="text-sm text-slate-500">
          {pendingVerifications.length} drivers pending verification
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => selected && console.log("approve", selected.id)}
          disabled={!selected}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCircle size={16} />
          Approve Selected
        </button>
        <button
          onClick={() => selected && setShowRejectModal(true)}
          disabled={!selected}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <XCircle size={16} />
          Reject Selected
        </button>
      </div>

      <DataTable
        columns={columns}
        data={pendingVerifications}
        onRowClick={(row) => setSelected(row)}
      />

      {/* Document Preview */}
      {selected && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Documents — {selected.driverName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selected.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <FileText size={24} className="text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{doc.type}</p>
                  <p className="text-xs text-slate-400 truncate">{doc.file}</p>
                </div>
                <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500">
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectNotes("");
        }}
        title="Reject Verification"
        footer={
          <>
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectNotes("");
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log("reject", selected?.id, rejectNotes);
                setShowRejectModal(false);
                setRejectNotes("");
                setSelected(null);
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to reject the verification for{" "}
            <strong>{selected?.driverName}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason / Notes
            </label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Explain why this verification is being rejected..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
