import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import api from "@/lib/api";
import { useNotificationsStore } from "@/stores/notifications.store";
import type { ApiResponse, Notification } from "@sundogo/types";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Notification[]>>("/api/driver/notifications");
      return data.data ?? [];
    },
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/driver/notifications/read-all");
    },
    onSuccess: () => {
      markAllRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadExists = notifications?.some((n) => !n.read);

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pt-12 pb-12 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadExists && (
            <button
              onClick={() => readAllMutation.mutate()}
              className="flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto -mt-6 w-full max-w-lg space-y-2 px-4 pb-6">
        {!notifications || notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Bell className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl bg-white p-4 shadow-sm transition-colors ${
                !n.read ? "border-l-4 border-primary-500" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                    !n.read ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-[11px] text-gray-300">{formatTime(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}
