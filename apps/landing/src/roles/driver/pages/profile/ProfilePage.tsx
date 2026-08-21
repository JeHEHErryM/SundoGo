import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Camera,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";
import { fileToResizedDataUrl } from "@/lib/image";
import { useAuthStore } from "@/stores/auth.store";
import { Avatar, LoadingOverlay } from "@/components/shared";
import type { ApiResponse, Driver, Vehicle } from "@sundogo/types";

interface ProfileData {
  driver: Driver;
  vehicle?: Vehicle;
  averageRating: number;
  totalTrips: number;
}

interface UpdatedUser {
  passenger?: { firstName?: string; lastName?: string; phone?: string } | null;
  driver?: { firstName?: string; lastName?: string; phone?: string } | null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);

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
  const displayName =
    [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "Driver";

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<ApiResponse<UpdatedUser>>("/api/auth/profile", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      return data.data!;
    },
    onSuccess: (updated) => {
      const roleProfile = updated.driver ?? updated.passenger ?? null;
      if (user) {
        setUser({
          ...user,
          firstName: roleProfile?.firstName ?? user.firstName,
          lastName: roleProfile?.lastName ?? user.lastName,
          phone: roleProfile?.phone ?? user.phone,
        });
      }
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const avatarUrl = await fileToResizedDataUrl(file);
      await api.patch("/api/auth/profile", { avatarUrl });
      return avatarUrl;
    },
    onSuccess: (avatarUrl) => {
      if (user) setUser({ ...user, avatar: avatarUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

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
    <div className="min-h-dvh bg-slate-50">
      <LoadingOverlay
        show={saveProfile.isPending || uploadAvatar.isPending}
        message="Saving your profile ..."
      />

      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-5 pb-5 pt-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar name={displayName} src={user?.avatar} size="xl" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-md ring-2 ring-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar.mutate(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-slate-900">{displayName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-slate-500">
                {rating > 0 ? `${rating.toFixed(1)} rating` : "No ratings yet"}
              </span>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => {
                setFirstName(driver?.firstName ?? "");
                setLastName(driver?.lastName ?? "");
                setPhone(driver?.phone ?? "");
                setEditing(true);
              }}
              className="h-9 shrink-0 rounded-full bg-primary-50 px-4 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-4">
        {saved && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle2 size={16} />
            Profile updated
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Edit Profile</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">First Name</label>
                <div className="relative mt-1">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Last Name</label>
                <div className="relative mt-1">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Phone</label>
              <div className="relative mt-1">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>
            {(saveProfile.isError || uploadAvatar.isError) && (
              <p className="text-xs text-danger-600">Could not save your changes. Please try again.</p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="h-10 flex-1 rounded-lg bg-slate-100 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => saveProfile.mutate()}
                disabled={saveProfile.isPending || !firstName.trim()}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                {saveProfile.isPending && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <InfoRow icon={<User className="h-5 w-5 text-gray-400" />} label="Name" value={displayName} />
          <InfoRow icon={<Phone className="h-5 w-5 text-gray-400" />} label="Phone" value={driver?.phone ?? "—"} />
          <InfoRow icon={<Mail className="h-5 w-5 text-gray-400" />} label="Email" value={user?.email ?? "—"} />
        </div>

        {/* Vehicle */}
        {veh && (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
          className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-colors hover:bg-gray-50"
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
