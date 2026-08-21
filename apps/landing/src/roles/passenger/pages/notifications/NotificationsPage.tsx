import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import api from "@/lib/api";
import { Skeleton, EmptyState, ErrorState, timeAgo } from "@/components/shared";
import type { ApiResponse, Notification } from "@sundogo/types";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ data: Notification[]; total: number }>>("/api/notifications");
      return data.data?.data ?? [];
    },
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      await api.patch("/api/notifications/read-all");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadExists = notifications?.some((n) => !n.read);

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 pb-3 pt-4">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
        </div>
        {unreadExists && (
          <button
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 disabled:opacity-50"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="safe-area-pb space-y-2 px-5 pb-8 pt-3">
        {isError ? (
          <div className="rounded-2xl bg-white shadow-sm">
            <ErrorState message="Could not load notifications." onRetry={() => refetch()} />
          </div>
        ) : isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : (notifications ?? []).length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm">
            <EmptyState
              illustration="notifications"
              title="No notifications yet"
              description="Booking updates and driver alerts will appear here."
            />
          </div>
        ) : (
          notifications!.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl border border-slate-100 bg-white p-4 ${
                !notif.read ? "ring-1 ring-primary-100" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    !notif.read ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Bell size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{notif.title}</p>
                    {!notif.read && <div className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">{notif.body}</p>
                  <p className="mt-1.5 text-[11px] text-slate-400">{timeAgo(notif.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
