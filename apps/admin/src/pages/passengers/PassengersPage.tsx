import { useState } from "react";
import { Search } from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";

interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_trips: number;
  joined: string;
  [key: string]: unknown;
}

const passengers: Passenger[] = [
  { id: "P001", name: "Alice Njoroge", email: "alice@email.com", phone: "+254710000001", total_trips: 45, joined: "2024-06-12" },
  { id: "P002", name: "Bob Kiptoo", email: "bob@email.com", phone: "+254710000002", total_trips: 12, joined: "2025-01-20" },
  { id: "P003", name: "Carol Mutua", email: "carol@email.com", phone: "+254710000003", total_trips: 89, joined: "2024-02-08" },
  { id: "P004", name: "David Wekesa", email: "david.w@email.com", phone: "+254710000004", total_trips: 3, joined: "2026-07-30" },
  { id: "P005", name: "Eve Chebet", email: "eve@email.com", phone: "+254710000005", total_trips: 67, joined: "2024-09-05" },
  { id: "P006", name: "Frank Odhiambo", email: "frank@email.com", phone: "+254710000006", total_trips: 28, joined: "2025-03-14" },
  { id: "P007", name: "Grace Wafula", email: "grace.w@email.com", phone: "+254710000007", total_trips: 156, joined: "2023-11-22" },
  { id: "P008", name: "Henry Maina", email: "henry@email.com", phone: "+254710000008", total_trips: 5, joined: "2026-05-10" },
  { id: "P009", name: "Irene Auma", email: "irene@email.com", phone: "+254710000009", total_trips: 34, joined: "2025-08-19" },
  { id: "P010", name: "James Kibet", email: "james.k@email.com", phone: "+254710000010", total_trips: 91, joined: "2024-04-01" },
];

const columns: Column<Passenger>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "phone", label: "Phone" },
  { key: "total_trips", label: "Total Trips", sortable: true },
  { key: "joined", label: "Joined", sortable: true },
];

export default function PassengersPage() {
  const [search, setSearch] = useState("");

  const filtered = passengers.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Passengers</h1>
        <p className="text-sm text-slate-500">Manage passenger accounts</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
