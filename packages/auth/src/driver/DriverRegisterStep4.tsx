import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  documents: { idImage: File | null; licenseImage: File | null; orcrImage: File | null };
  onDocumentsUpdate: (docs: { idImage: File | null; licenseImage: File | null; orcrImage: File | null }) => void;
  personalData: { firstName: string; lastName: string; email: string; phone: string };
  vehicleData: { plateNumber: string; vehicleModel: string; vehicleColor: string };
}

function FileUpload({ label, file, onChange, accept = 'image/*' }: { label: string; file: File | null; onChange: (f: File | null) => void; accept?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
        {file ? (
          <>
            <CheckCircle size={20} className="text-green-500 shrink-0" />
            <span className="text-sm text-slate-700 truncate">{file.name}</span>
          </>
        ) : (
          <>
            <Upload size={20} className="text-slate-400 shrink-0" />
            <span className="text-sm text-slate-500">Tap to upload {label.toLowerCase()}</span>
          </>
        )}
        <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
      </label>
    </div>
  );
}

export function DriverRegisterStep4({ documents, onDocumentsUpdate, personalData, vehicleData }: Props) {
  const allUploaded = documents.idImage && documents.licenseImage && documents.orcrImage;

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Documents & Review</h2>
        <p className="text-sm text-slate-500 mt-1">Upload your documents and review your information</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Required Documents</h3>
        <FileUpload label="Government ID" file={documents.idImage} onChange={(f) => onDocumentsUpdate({ ...documents, idImage: f })} />
        <FileUpload label="Driver's License" file={documents.licenseImage} onChange={(f) => onDocumentsUpdate({ ...documents, licenseImage: f })} />
        <FileUpload label="OR/CR (Vehicle Registration)" file={documents.orcrImage} onChange={(f) => onDocumentsUpdate({ ...documents, orcrImage: f })} />
      </div>

      {!allUploaded && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <AlertCircle size={16} />
          <span className="text-sm">Please upload all required documents to continue</span>
        </div>
      )}

      <div className="border-t border-slate-200 pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Review Your Information</h3>

        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-900">{personalData.firstName} {personalData.lastName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-900">{personalData.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-slate-900">{personalData.phone}</span>
          </div>
          <div className="border-t border-slate-200 my-2" />
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Vehicle</span>
            <span className="font-medium text-slate-900">{vehicleData.vehicleModel} ({vehicleData.vehicleColor})</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Plate No.</span>
            <span className="font-medium text-slate-900">{vehicleData.plateNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}