import { ChevronRight, Star, CheckCircle2, XCircle } from "lucide-react";

interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  fare: number;
  status: "completed" | "cancelled";
  rating?: number;
}

const trips: Trip[] = [
  { id: "1", from: "SM City Cebu", to: "Cebu IT Park", date: "Today, 2:30 PM", fare: 75, status: "completed", rating: 5 },
  { id: "2", from: "Carbon Market", to: "Fuente Osmeña Circle", date: "Yesterday, 10:15 AM", fare: 45, status: "completed", rating: 4 },
  { id: "3", from: "Cebu Business Park", to: "Mactan Airport", date: "Aug 18, 6:00 AM", fare: 250, status: "completed", rating: 5 },
  { id: "4", from: "Lahug", to: "Busay", date: "Aug 17, 3:45 PM", fare: 0, status: "cancelled" },
  { id: "5", from: "Colon Street", to: "Taboan Public Market", date: "Aug 15, 9:00 AM", fare: 35, status: "completed", rating: 3 },
];

export default function TripHistoryPage() {

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Trip History</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your recent rides</p>
      </div>

      {/* Filters */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto">
        {["All", "Completed", "Cancelled"].map((filter) => (
          <button
            key={filter}
            className="px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap bg-blue-600 text-white"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Trip list */}
      <div className="px-5 py-2 space-y-3 pb-8">
        {trips.map((trip) => (
          <button
            key={trip.id}
            className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {trip.status === "completed" ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-400" />
                )}
                <span className={`text-xs font-medium ${trip.status === "completed" ? "text-green-600" : "text-red-500"}`}>
                  {trip.status === "completed" ? "Completed" : "Cancelled"}
                </span>
              </div>
              <span className="text-xs text-slate-400">{trip.date}</span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex flex-col items-center gap-0.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="w-0.5 h-4 bg-slate-200" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{trip.from}</p>
                <div className="h-2" />
                <p className="text-sm font-medium text-slate-900 truncate">{trip.to}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
              <div className="flex items-center gap-3">
                {trip.fare > 0 && (
                  <span className="text-sm font-bold text-slate-900">₱{trip.fare.toFixed(2)}</span>
                )}
                {trip.rating && (
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span className="text-xs text-slate-500">{trip.rating}</span>
                  </div>
                )}
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
