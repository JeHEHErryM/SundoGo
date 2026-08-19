import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Star, CheckCircle, XCircle, Car } from "lucide-react";
import StatusBadge, { getStatusVariant } from "@/components/StatusBadge";

const driverData: Record<string, {
  name: string;
  email: string;
  phone: string;
  verification_status: string;
  status: string;
  rating: number;
  total_trips: number;
  joined: string;
  vehicle: { make: string; model: string; plate: string; year: number };
  documents: { type: string; status: string }[];
  recentTrips: { id: string; date: string; pickup: string; destination: string; fare: number; rating: number }[];
  reviews: { id: string; passenger: string; rating: number; comment: string; date: string }[];
}> = {
  D001: {
    name: "James Mwangi",
    email: "james@email.com",
    phone: "+254700100100",
    verification_status: "verified",
    status: "active",
    rating: 4.8,
    total_trips: 342,
    joined: "2024-03-15",
    vehicle: { make: "Toyota", model: "Corolla", plate: "KAA 123B", year: 2021 },
    documents: [
      { type: "Driver's License", status: "approved" },
      { type: "Vehicle Registration", status: "approved" },
      { type: "Insurance Certificate", status: "approved" },
      { type: "National ID", status: "approved" },
    ],
    recentTrips: [
      { id: "T001", date: "2026-08-19", pickup: "Westlands Mall", destination: "JKIA Terminal 1", fare: 1850, rating: 5 },
      { id: "T002", date: "2026-08-19", pickup: "CBD Town", destination: "Karen Hospital", fare: 1200, rating: 4 },
      { id: "T003", date: "2026-08-18", pickup: "Kiambu Road", destination: "Two Rivers Mall", fare: 650, rating: 5 },
    ],
    reviews: [
      { id: "R001", passenger: "Alice N.", rating: 5, comment: "Very professional and clean car", date: "2026-08-19" },
      { id: "R002", passenger: "Mike O.", rating: 4, comment: "Good drive, a bit slow", date: "2026-08-18" },
    ],
  },
};

const defaultDriver = {
  name: "Driver Not Found",
  email: "",
  phone: "",
  verification_status: "pending_verification",
  status: "inactive",
  rating: 0,
  total_trips: 0,
  joined: "",
  vehicle: { make: "", model: "", plate: "", year: 0 },
  documents: [],
  recentTrips: [],
  reviews: [],
};

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const driver = driverData[id || ""] || { ...defaultDriver, name: `Driver ${id}` };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{driver.name}</h1>
          <p className="text-sm text-slate-500">Driver ID: {id}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {driver.verification_status === "pending_verification" && (
            <>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                <CheckCircle size={16} />
                Approve
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
                <XCircle size={16} />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
              {driver.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{driver.name}</h3>
              <StatusBadge
                label={driver.status}
                variant={getStatusVariant(driver.status)}
              />
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={16} className="text-slate-400" />
              {driver.email || "—"}
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={16} className="text-slate-400" />
              {driver.phone || "—"}
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Star size={16} className="text-amber-400" />
              {driver.rating > 0 ? `${driver.rating} / 5.0` : "No ratings"} · {driver.total_trips} trips
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-400">
              Joined {driver.joined || "—"}
            </div>
          </div>
        </div>

        {/* Vehicle & Documents */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Car size={16} />
              Vehicle Information
            </h3>
            {driver.vehicle.make ? (
              <div className="space-y-2 text-sm">
                <p className="text-slate-700"><span className="text-slate-500">Make:</span> {driver.vehicle.make}</p>
                <p className="text-slate-700"><span className="text-slate-500">Model:</span> {driver.vehicle.model}</p>
                <p className="text-slate-700"><span className="text-slate-500">Year:</span> {driver.vehicle.year}</p>
                <p className="text-slate-700"><span className="text-slate-500">Plate:</span> <span className="font-mono font-medium">{driver.vehicle.plate}</span></p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No vehicle information</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Documents</h3>
            {driver.documents.length > 0 ? (
              <div className="space-y-2">
                {driver.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-700">{doc.type}</span>
                    <StatusBadge label={doc.status} variant={getStatusVariant(doc.status)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No documents uploaded</p>
            )}
          </div>
        </div>

        {/* Recent Trips */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Recent Trips</h3>
          {driver.recentTrips.length > 0 ? (
            <div className="space-y-3">
              {driver.recentTrips.map((trip) => (
                <div key={trip.id} className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{trip.date}</span>
                    <span className="text-slate-700">KES {trip.fare.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{trip.pickup} → {trip.destination}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < trip.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No trips yet</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      {driver.reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driver.reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">{review.passenger}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
                <p className="text-xs text-slate-400 mt-2">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
