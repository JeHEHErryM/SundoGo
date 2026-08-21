import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";
import DataTable, { type Column } from "@/components/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import Badge from "@/components/shared/Badge";
import Avatar from "@/components/shared/Avatar";
import SegmentedControl from "@/components/shared/SegmentedControl";
import { EmptyState } from "@/components/shared";
import { fullName } from "@/components/shared";

interface AdminDriver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  user: { email: string; createdAt: string };
  verification: { status: string } | null;
  vehicle: { plateNumber: string; model: string; color: string } | null;
  availability: { status: string } | null;
  _count: { bookings: number; trips: number; reviews: number };
}

type VerificationFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED";

const columns: Column<AdminDriver>[] = [
  {
    key: "name",
    label: "Driver",
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
    key: "verification",
    label: "Verification",
    render: (row) => <Badge label={row.verification?.status ?? "PENDING"} size="sm" />,
  },
  {
    key: "vehicle",
    label: "Vehicle",
    hideOnMobile: true,
    render: (row) =>
      row.vehicle ? (
        <span className="text-slate-600">
          {row.vehicle.model} · <span className="font-semibold">{row.vehicle.plateNumber}</span>
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  {
    key: "trips",
    label: "Trips",
    render: (row) => <span className="font-semibold text-slate-700">{row._count.trips}</span>,
  },
  {
    key: "availability",
    label: "Status",
    render: (row) => <Badge label={row.availability?.status ?? "OFFLINE"} size="sm" />,
  },
];

export default function DriversPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [verification, setVerification] = useState<VerificationFilter>("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "drivers", page, search, verification],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search.trim()) params.set("q", search.trim());
      if (verification !== "ALL") params.set("verification", verification);
      const { data } = await api.get<ApiResponse<{ data: AdminDriver[]; total: number }>>(
        `/api/admin/drivers?${params.toString()}`
      );
      return data.data!;
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Drivers" description="Manage driver accounts and verifications" />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, phone, plate…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:outline-none"
          />
        </div>
        <SegmentedControl<VerificationFilter>
          value={verification}
          onChange={(v) => {
            setVerification(v);
            setPage(1);
          }}
          options={[
            { value: "ALL", label: "All" },
            { value: "APPROVED", label: "Verified" },
            { value: "PENDING", label: "Pending" },
            { value: "REJECTED", label: "Rejected" },
          ]}
        />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center">
          <p className="text-sm text-slate-500">Failed to load drivers.</p>
          <button onClick={() => refetch()} className="mt-3 text-sm font-semibold text-primary-600">
            Retry
          </button>
        </div>
      ) : !isLoading && (data?.data.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            illustration="search"
            title="No drivers found"
            description={
              search || verification !== "ALL"
                ? "Try adjusting your search or filters."
                : "Registered drivers will appear here."
            }
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
          emptyMessage="No drivers found"
          onRowClick={(row) => navigate(`/user/admin/drivers/${row.id}`)}
        />
      )}
    </div>
  );
}
