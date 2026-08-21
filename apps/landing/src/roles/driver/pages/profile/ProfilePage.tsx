import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Phone,
  Mail,
  Car,
  ShieldCheck,
  Star,
  LogOut,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse, Driver, Vehicle } from "@sundogo/types";

interface ProfileData {
  driver: Driver;
  vehicle?: Vehicle;
  averageRating: number;
  totalTrips: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ProfileData>>("/api/driver/profile");
      return data.data!;
    },
  });

  const driver = profile?.driver ?? user;
  const veh = profile?.vehicle;
  const rating = profile?.averageRating ?? 0;
  void profile?.totalTrips;

  const handleLogout = () => {
    logout();
    navigate("/user/driver/login", { replace: true });
  };

  const verifStatusColor: Record<string, string> = {
    APPROVED: "bg-success-100 text-success-700",
    PENDING: "bg-amber-100 text-amber-700",
    REJECTED: "bg-danger-100 text-danger-600",
  };

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 pt-12 pb-16 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-2xl font-bold">
            {driver?.firstName?.[0]}{driver?.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">{driver?.firstName} {driver?.lastName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-slate-300">{rating > 0 ? rating.toFixed(1) : "N/A"} rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-8 w-full max-w-lg space-y-4 px-4 pb-6">
        {/* Info Cards */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <InfoRow icon={<User className="h-5 w-5 text-gray-400" />} label="Name" value={`${driver?.firstName} ${driver?.lastName}`} />
          <InfoRow icon={<Phone className="h-5 w-5 text-gray-400" />} label="Phone" value={driver?.phone ?? "—"} />
          <InfoRow icon={<Mail className="h-5 w-5 text-gray-400" />} label="Email" value={driver?.userId ?? "—"} />
        </div>

        {/* Vehicle */}
        {veh && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
              <Car className="h-4 w-4" /> Vehicle
            </h3>
            <InfoRow icon={<CreditCard className="h-5 w-5 text-gray-400" />} label="Plate" value={veh.plateNumber} />
            <InfoRow icon={<Car className="h-5 w-5 text-gray-400" />} label="Model" value={veh.model} />
            <InfoRow icon={<span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: veh.color }} />} label="Color" value={veh.color} />
          </div>
        )}

        {/* Verification */}
        <button
          onClick={() => navigate("/user/driver/verification")}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary-500" />
            <div className="text-left">
              <p className="font-medium text-gray-800">Verification Status</p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${verifStatusColor[driver?.verificationStatus ?? "PENDING"]}`}>
                {driver?.verificationStatus ?? "PENDING"}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-danger-200 bg-danger-50 py-4 text-base font-semibold text-danger-600 transition-all hover:bg-danger-100 active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 not-last:border-b border-gray-50">
      {icon}
      <div className="flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
