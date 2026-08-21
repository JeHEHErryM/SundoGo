import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Phone,
  Mail,
  Star,
  CheckCircle,
  XCircle,
  Car,
  FileText,
  CalendarDays,
} from "lucide-react";
import api from "@/lib/api";
import type { ApiResponse } from "@sundogo/types";
import PageHeader from "@/components/shared/PageHeader";
import Badge from "@/components/shared/Badge";
import Avatar from "@/components/shared/Avatar";
import Sheet from "@/components/shared/Sheet";
import Button from "@/components/shared/Button";
import { Skeleton } from "@/components/shared/Skeleton";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import { useToast } from "@/components/shared";
import { formatCurrency, formatDate, fullName } from "@/components/shared";

interface AdminDriverDetail {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  user: { email: string; createdAt: string };
  verification: {
    id: string;
    status: string;
    idImageUrl?: string;
    licenseImageUrl?: string;
    orcrImageUrl?: string;
    notes?: string;
    reviewedAt?: string;
  } | null;
  vehicle: { plateNumber: string; model: string; color: string } | null;
  availability: { status: string } | null;
  trips: Array<{
    id: string;
    status: string;
    completedAt?: string;
    booking: { pickupAddress?: string; destinationAddress?: string; totalFare: number };
  }>;
  reviews: Array<{ id: string; rating: number; comment?: string; createdAt: string }>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          className={i < Math.round(rating) ? "fill-accent-400 text-accent-400" : "text-slate-200"}
        />
      ))}
    </div>
  );
}

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const { data: driver, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "driver", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminDriverDetail>>(`/api/admin/drivers/${id}`);
      return data.data!;
    },
    enabled: !!id,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "driver", id] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const approve = useMutation({
    mutationFn: async () => {
      if (!driver?.verification) throw new Error("No verification submitted");
      await api.patch(`/api/driver-verification/${driver.verification.id}/approve`);
    },
    onSuccess: () => {
      toast("success", "Driver approved");
      invalidate();
    },
    onError: () => toast("error", "Failed to approve driver"),
  });

  const reject = useMutation({
    mutationFn: async (notes: string) => {
      if (!driver?.verification) throw new Error("No verification submitted");
      await api.patch(`/api/driver-verification/${driver.verification.id}/reject`, { notes });
    },
    onSuccess: () => {
      toast("success", "Verification rejected");
      setRejectOpen(false);
      setRejectNotes("");
      invalidate();
    },
    onError: () => toast("error", "Failed to reject verification"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !driver) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white">
        <ErrorState title="Driver not found" message="This driver may have been removed." onRetry={() => refetch()} />
      </div>
    );
  }

  const name = fullName(driver);
  const avgRating =
    driver.reviews.length > 0
      ? driver.reviews.reduce((s, r) => s + r.rating, 0) / driver.reviews.length
      : null;

  const documents = [
    { label: "National ID", url: driver.verification?.idImageUrl },
    { label: "Driver's License", url: driver.verification?.licenseImageUrl },
    { label: "OR/CR", url: driver.verification?.orcrImageUrl },
  ].filter((d) => !!d.url);

  const isPending = driver.verification?.status === "PENDING";

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/user/admin/drivers")}
        className="press inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Back to drivers
      </button>

      <PageHeader
        title={name}
        description={`Driver since ${formatDate(driver.user.createdAt)}`}
        actions={
          <>
            {isPending && (
              <>
                <Button
                  variant="success"
                  onClick={() => approve.mutate()}
                  loading={approve.isPending}
                >
                  <CheckCircle size={16} />
                  Approve
                </Button>
                <Button variant="danger" onClick={() => setRejectOpen(true)}>
                  <XCircle size={16} />
                  Reject
                </Button>
              </>
            )}
            {!isPending && (
              <Badge label={driver.verification?.status ?? "PENDING"} />
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-4">
            <Avatar name={name} src={driver.avatarUrl} size="xl" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">{name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge label={driver.availability?.status ?? "OFFLINE"} size="sm" />
              </div>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={15} className="shrink-0 text-slate-400" />
              <dd className="truncate">{driver.user.email}</dd>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={15} className="shrink-0 text-slate-400" />
              <dd>{driver.phone || "—"}</dd>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Star size={15} className="shrink-0 text-accent-400" />
              <dd>
                {avgRating ? `${avgRating.toFixed(1)} / 5.0` : "No ratings yet"}
                <span className="text-slate-400"> · {driver.trips.length} recent trips</span>
              </dd>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
              <CalendarDays size={14} className="shrink-0" />
              <dd>Joined {formatDate(driver.user.createdAt)}</dd>
            </div>
          </dl>
        </section>

        {/* Vehicle + Documents */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Car size={14} />
              Vehicle Information
            </h3>
            {driver.vehicle ? (
              <div className="space-y-2.5 text-sm">
                <p className="flex justify-between text-slate-600">
                  <span>Model</span> <span className="font-medium text-slate-800">{driver.vehicle.model}</span>
                </p>
                <p className="flex justify-between text-slate-600">
                  <span>Color</span> <span className="font-medium text-slate-800">{driver.vehicle.color}</span>
                </p>
                <p className="flex justify-between text-slate-600">
                  <span>Plate</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                    {driver.vehicle.plateNumber}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No vehicle registered</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <FileText size={14} />
              Documents
            </h3>
            {documents.length > 0 ? (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.label}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 transition-colors hover:bg-primary-50"
                    >
                      <span className="text-sm font-medium text-slate-700 group-hover:text-primary-700">
                        {doc.label}
                      </span>
                      <span className="text-xs font-semibold text-primary-600">View</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No documents uploaded</p>
            )}
            {driver.verification?.notes && (
              <p className="mt-3 rounded-xl bg-danger-50 px-3.5 py-2.5 text-xs text-danger-700">
                Notes: {driver.verification.notes}
              </p>
            )}
          </div>
        </section>

        {/* Recent trips */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Trips</h3>
          {driver.trips.length === 0 ? (
            <EmptyState illustration="trips" title="No trips yet" description="Completed trips will appear here." />
          ) : (
            <ul className="space-y-3">
              {driver.trips.map((trip) => (
                <li key={trip.id} className="rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{formatDate(trip.completedAt)}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(trip.booking.totalFare)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {trip.booking.pickupAddress ?? "Pickup"} → {trip.booking.destinationAddress ?? "Destination"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Reviews */}
      {driver.reviews.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Passenger Reviews ({driver.reviews.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {driver.reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600">{review.comment || "No comment provided."}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Reject modal */}
      <Sheet open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Verification">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Reject the verification for <strong>{name}</strong>? The driver will need to resubmit documents.
          </p>
          <div>
            <label htmlFor="reject-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason / Notes
            </label>
            <textarea
              id="reject-notes"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              placeholder="Explain why this verification is being rejected…"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => reject.mutate(rejectNotes)}
              loading={reject.isPending}
              disabled={!rejectNotes.trim()}
            >
              Reject Verification
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
