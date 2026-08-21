import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "booking" | "promo" | "system";
}

const notifications: Notification[] = [
  { id: "1", title: "Trip Completed", body: "Your trip to SM City Cebu is completed. Total fare: ₱75.00", time: "2h ago", read: false, type: "booking" },
  { id: "2", title: "Promo: 50% OFF", body: "Use code SUNDogo50 on your next ride and save 50%!", time: "5h ago", read: false, type: "promo" },
  { id: "3", title: "Driver Assigned", body: "Mang Rodel is on the way to your pickup point.", time: "Yesterday", read: true, type: "booking" },
  { id: "4", title: "Safety Update", body: "We've added new emergency features. Check them out in your profile.", time: "2 days ago", read: true, type: "system" },
  { id: "5", title: "Trip Receipt", body: "Your receipt for trip to Cebu IT Park is ready.", time: "3 days ago", read: true, type: "booking" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();

  const typeColors: Record<string, string> = {
    booking: "bg-primary-100 text-primary-600",
    promo: "bg-amber-100 text-amber-600",
    system: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
        </div>
        <button className="text-xs text-primary-600 font-medium">Mark all read</button>
      </div>

      {/* Notification list */}
      <div className="px-5 py-3 space-y-2 pb-8">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`bg-white rounded-2xl p-4 border border-slate-100 ${
              !notif.read ? "ring-1 ring-primary-100" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColors[notif.type]}`}>
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-slate-900">{notif.title}</p>
                  {!notif.read && <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{notif.body}</p>
                <p className="text-[11px] text-slate-400 mt-1.5">{notif.time}</p>
              </div>
              <button className="p-1 text-slate-300 hover:text-slate-500 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
