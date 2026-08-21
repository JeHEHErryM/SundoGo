import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";
import DataTable, { type Column } from "@/components/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import Avatar from "@/components/shared/Avatar";
import EmptyState from "@/components/shared/EmptyState";
import { formatDate, fullName } from "@/components/shared";

interface AdminPassenger {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  user: { email: string; createdAt: string };
  _count: { bookings: number; trips: number };
}

const columns: Column<AdminPassenger>[] = [
  {
    key: "name",
    label: "Passenger",
    primary: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={fullName(row)} src={row.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800">{fullName(row)}</p>
          <p className="truncate text-xs text-slate-400">{row.user.email}</p>
        </div>
      </div>
    ),
  },
  { key: "phone", label: "Phone", hideOnMobile: true },
  {
    key: "bookings",
    label: "Bookings",
    render: (row) => <span className="font-semibold text-slate-700">{row._count.bookings}</span>,
  },
  {
    key: "trips",
    label: "Trips",
    render: (row) => <span className="font-semibold text-slate-700">{row._count.trips}</span>,
  },
  {
    key: "joined",
    label: "Joined",
    hideOnMobile: true,
    render: (row) => <span className="text-slate-500">{formatDate(row.user.createdAt)}</span>,
  },
];

export default function PassengersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "passengers", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search.trim()) params.set("q", search.trim());
      const { data } = await api.get<ApiResponse<{ data: AdminPassenger[]; total: number }>>(
        `/api/admin/passengers?${params.toString()}`
      );
      return data.data!;
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Passengers" description="Manage passenger accounts" />

      <div className="relative w-full max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name, email, or phone…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:outline-none"
        />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center">
          <p className="text-sm text-slate-500">Failed to load passengers.</p>
          <button onClick={() => refetch()} className="mt-3 text-sm font-semibold text-primary-600">
            Retry
          </button>
        </div>
      ) : !isLoading && (data?.data.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            illustration="search"
            title="No passengers found"
            description={search ? "Try a different search term." : "Registered passengers will appear here."}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          serverPaginated
          total={data?.total}
          page={page}
          onPageChange={setPage}
          emptyMessage="No passengers found"
        />
      )}
    </div>
  );
}
