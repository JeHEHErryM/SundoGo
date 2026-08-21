import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import api from "@/lib/api";
import { useNotificationsStore } from "@/stores/notifications.store";
import { Skeleton, EmptyState, ErrorState, timeAgo } from "@/components/shared";
import type { ApiResponse, Notification } from "@sundogo/types";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const markAllReadStore = useNotificationsStore((s) => s.markAllRead);

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
      markAllReadStore();
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadExists = notifications?.some((n) => !n.read);

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pb-12 pt-10 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadExists && (
            <button
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending}
              className="flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200 disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="safe-area-pb mx-auto -mt-6 w-full max-w-lg space-y-2 px-4 pb-6">
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
              description="Booking updates and alerts will appear here."
            />
          </div>
        ) : (
          notifications!.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl bg-white p-4 shadow-sm transition-colors ${
                !n.read ? "border-l-4 border-primary-500" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    !n.read ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.body}</p>
                  <p className="mt-1 text-[11px] text-gray-300">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
