import { useState } from "react";
import { Search } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import StatusBadge, { getStatusVariant } from "../../components/StatusBadge";

interface Booking {
  id: string;
  passenger: string;
  driver: string;
  status: string;
  pickup: string;
  destination: string;
  fare: number;
  date: string;
  [key: string]: unknown;
}

const bookings: Booking[] = [
  { id: "BK001", passenger: "Alice Njoroge", driver: "James Mwangi", status: "completed", pickup: "Westlands Mall", destination: "JKIA Terminal 1", fare: 1850, date: "2026-08-19" },
  { id: "BK002", passenger: "Bob Kiptoo", driver: "Sarah Otieno", status: "in_progress", pickup: "CBD Town", destination: "Karen Hospital", fare: 1200, date: "2026-08-19" },
  { id: "BK003", passenger: "Carol Mutua", driver: "Grace Wanjiku", status: "completed", pickup: "Kiambu Road", destination: "Two Rivers Mall", fare: 650, date: "2026-08-19" },
  { id: "BK004", passenger: "David Wekesa", driver: "Alice Njeri", status: "cancelled", pickup: "Kasarani", destination: "City Center", fare: 0, date: "2026-08-18" },
  { id: "BK005", passenger: "Eve Chebet", driver: "James Mwangi", status: "completed", pickup: "Langata", destination: "Garden City Mall", fare: 980, date: "2026-08-18" },
  { id: "BK006", passenger: "Frank Odhiambo", driver: "Mary Akinyi", status: "active", pickup: "Thika Road", destination: "South B", fare: 750, date: "2026-08-19" },
  { id: "BK007", passenger: "Grace Wafula", driver: "Sarah Otieno", status: "completed", pickup: "Mombasa Road", destination: "Embu Town", fare: 3200, date: "2026-08-17" },
  { id: "BK008", passenger: "Henry Maina", driver: "Grace Wanjiku", status: "completed", pickup: "Ngong Road", destination: "Karen", fare: 420, date: "2026-08-17" },
  { id: "BK009", passenger: "Irene Auma", driver: "Alice Njeri", status: "cancelled", pickup: "Runda", destination: "Westlands", fare: 0, date: "2026-08-16" },
  { id: "BK010", passenger: "James Kibet", driver: "Mary Akinyi", status: "completed", pickup: "Uthiru", destination: "UN Park", fare: 550, date: "2026-08-16" },
];

const columns: Column<Booking>[] = [
  { key: "id", label: "ID" },
  { key: "passenger", label: "Passenger", sortable: true },
  { key: "driver", label: "Driver", sortable: true },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <StatusBadge
        label={String(row.status).replace(/_/g, " ")}
        variant={getStatusVariant(String(row.status))}
      />
    ),
  },
  { key: "pickup", label: "Pickup" },
  { key: "destination", label: "Destination" },
  {
    key: "fare",
    label: "Fare",
    sortable: true,
    render: (row) => (
      <span className="font-medium">{Number(row.fare) > 0 ? `KES ${Number(row.fare).toLocaleString()}` : "—"}</span>
    ),
  },
  { key: "date", label: "Date", sortable: true },
];

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.passenger.toLowerCase().includes(search.toLowerCase()) ||
      b.driver.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.pickup.toLowerCase().includes(search.toLowerCase()) ||
      b.destination.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: bookings.length,
    active: bookings.filter((b) => b.status === "active" || b.status === "in_progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="text-sm text-slate-500">Track and manage all bookings</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "completed", "cancelled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, passenger, driver, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
