import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MapPin, Navigation } from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";
import { BookingStatus } from "@sundogo/types";
import DataTable, { type Column } from "@/components/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import Badge from "@/components/shared/Badge";
import SegmentedControl from "@/components/shared/SegmentedControl";
import Sheet from "@/components/shared/Sheet";
import EmptyState from "@/components/shared/EmptyState";
import { formatCurrency, formatDateTime, fullName } from "@/components/shared";

interface AdminBooking {
  id: string;
  status: BookingStatus;
  pickupAddress: string;
  destinationAddress: string;
  totalFare: string | number;
  pickupFee: string | number;
  createdAt: string;
  passenger: { firstName: string; lastName: string; phone: string } | null;
  driver: { firstName: string; lastName: string; phone: string } | null;
  serviceArea: { name: string } | null;
  payment: { amount: string; method: string; status: string } | null;
}

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: BookingStatus.ACCEPTED, label: "Active" },
  { value: BookingStatus.IN_PROGRESS, label: "In Progress" },
  { value: BookingStatus.COMPLETED, label: "Completed" },
  { value: BookingStatus.CANCELLED, label: "Cancelled" },
];

const columns: Column<AdminBooking>[] = [
  {
    key: "route",
    label: "Route",
    primary: true,
    render: (row) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={13} className="shrink-0 text-primary-600" />
          <span className="truncate font-medium text-slate-800">{row.pickupAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Navigation size={13} className="shrink-0 text-slate-400" />
          <span className="truncate text-slate-500">{row.destinationAddress}</span>
        </div>
      </div>
    ),
  },
  {
    key: "passenger",
    label: "Passenger",
    hideOnMobile: true,
    render: (row) => <span className="text-slate-700">{row.passenger ? fullName(row.passenger) : "—"}</span>,
  },
  {
    key: "driver",
    label: "Driver",
    hideOnMobile: true,
    render: (row) =>
      row.driver ? (
        <span className="text-slate-700">{fullName(row.driver)}</span>
      ) : (
        <span className="text-xs italic text-slate-400">Unassigned</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => <Badge label={row.status} />,
  },
  {
    key: "fare",
    label: "Fare",
    render: (row) => <span className="font-semibold text-slate-800">{formatCurrency(row.totalFare)}</span>,
  },
  {
    key: "createdAt",
    label: "Date",
    hideOnMobile: true,
    render: (row) => <span className="text-slate-500">{formatDateTime(row.createdAt)}</span>,
  },
];

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminBooking | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "bookings", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get<ApiResponse<{ data: AdminBooking[]; total: number }>>(
        `/api/admin/bookings?${params.toString()}`
      );
      return data.data!;
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Bookings" description="Monitor all ride bookings across the platform" />

      <SegmentedControl
        options={STATUS_TABS}
        value={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
      />

      {isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center">
          <p className="text-sm text-slate-500">Failed to load bookings.</p>
          <button onClick={() => refetch()} className="mt-3 text-sm font-semibold text-primary-600">
            Retry
          </button>
        </div>
      ) : !isLoading && (data?.data.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            illustration="trips"
            title="No bookings"
            description={
              statusFilter
                ? `No ${STATUS_TABS.find((t) => t.value === statusFilter)?.label.toLowerCase()} bookings right now.`
                : "Bookings will appear here once passengers start riding."
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          onRowClick={setSelected}
          serverPaginated
          total={data?.total}
          page={page}
          onPageChange={setPage}
          emptyMessage="No bookings found"
        />
      )}

      {/* Detail sheet */}
      <Sheet open={!!selected} onClose={() => setSelected(null)} title="Booking Details">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Badge label={selected.status} />
              <span className="text-xs text-slate-400">{formatDateTime(selected.createdAt)}</span>
            </div>

            {/* Route */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500 ring-4 ring-primary-100" />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Pickup</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{selected.pickupAddress}</p>
                </div>
              </div>
              <div className="ml-[4.5px] h-6 w-px border-l-2 border-dashed border-slate-300" />
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400" />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Destination</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{selected.destinationAddress}</p>
                </div>
              </div>
            </div>

            {/* People */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Passenger</dt>
                <dd className="font-medium text-slate-800">
                  {selected.passenger ? fullName(selected.passenger) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Driver</dt>
                <dd className="font-medium text-slate-800">
                  {selected.driver ? fullName(selected.driver) : "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Service Area</dt>
                <dd className="font-medium text-slate-800">{selected.serviceArea?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Payment</dt>
                <dd className="font-medium capitalize text-slate-800">
                  {selected.payment
                    ? `${selected.payment.method} · ${selected.payment.status.toLowerCase()}`
                    : "—"}
                </dd>
              </div>
            </dl>

            {/* Fare breakdown */}
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between py-0.5 text-sm">
                <span className="text-slate-500">Base + distance fare</span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(Number(selected.totalFare) - Number(selected.pickupFee))}
                </span>
              </div>
              <div className="flex justify-between py-0.5 text-sm">
                <span className="text-slate-500">Pickup fee</span>
                <span className="font-medium text-slate-700">{formatCurrency(selected.pickupFee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
                <span className="text-slate-900">Total</span>
                <span className="text-primary-700">{formatCurrency(selected.totalFare)}</span>
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
