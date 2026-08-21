import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import StatusBadge, { getStatusVariant } from "../../components/StatusBadge";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  verification_status: string;
  vehicle: string;
  rating: number;
  status: string;
  [key: string]: unknown;
}

const drivers: Driver[] = [
  { id: "D001", name: "James Mwangi", email: "james@email.com", phone: "+254700100100", verification_status: "verified", vehicle: "Toyota Corolla (KAA 123B)", rating: 4.8, status: "active" },
  { id: "D002", name: "Sarah Otieno", email: "sarah@email.com", phone: "+254700100200", verification_status: "verified", vehicle: "Honda Fit (KBB 456C)", rating: 4.6, status: "active" },
  { id: "D003", name: "Peter Kamau", email: "peter@email.com", phone: "+254700100300", verification_status: "pending_verification", vehicle: "Subaru Forester (KCC 789D)", rating: 0, status: "inactive" },
  { id: "D004", name: "Grace Wanjiku", email: "grace@email.com", phone: "+254700100400", verification_status: "verified", vehicle: "Nissan Note (KDD 012E)", rating: 4.9, status: "active" },
  { id: "D005", name: "David Ochieng", email: "david@email.com", phone: "+254700100500", verification_status: "rejected", vehicle: "Hyundai Accent (KEE 345F)", rating: 3.2, status: "deactivated" },
  { id: "D006", name: "Alice Njeri", email: "alice@email.com", phone: "+254700100600", verification_status: "verified", vehicle: "Toyota Vitz (KFF 678G)", rating: 4.7, status: "active" },
  { id: "D007", name: "Robert Kiprop", email: "robert@email.com", phone: "+254700100700", verification_status: "pending_verification", vehicle: "Mitsubishi Lancer (KGG 901H)", rating: 0, status: "inactive" },
  { id: "D008", name: "Mary Akinyi", email: "mary@email.com", phone: "+254700100800", verification_status: "verified", vehicle: "Suzuki Swift (KHH 234I)", rating: 4.4, status: "active" },
];

const columns: Column<Driver>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "phone", label: "Phone" },
  {
    key: "verification_status",
    label: "Verification",
    render: (row) => (
      <StatusBadge
        label={String(row.verification_status).replace(/_/g, " ")}
        variant={getStatusVariant(String(row.verification_status))}
      />
    ),
  },
  { key: "vehicle", label: "Vehicle" },
  {
    key: "rating",
    label: "Rating",
    sortable: true,
    render: (row) => (
      <span className="text-amber-500 font-medium">
        {Number(row.rating) > 0 ? `${Number(row.rating)} ★` : "—"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <StatusBadge
        label={String(row.status)}
        variant={getStatusVariant(String(row.status))}
      />
    ),
  },
];

export default function DriversPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = drivers.filter((d) => {
    const matchesSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
        <p className="text-sm text-slate-500">Manage driver accounts and verifications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/user/admin/drivers/${row.id}`)}
      />
    </div>
  );
}
