import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import {
  User, Mail, Phone, LogOut, Bell, Loader2, CheckCircle2, Camera,
} from "lucide-react";
import api from "@/lib/api";
import { fileToResizedDataUrl } from "@/lib/image";
import { Avatar, LoadingOverlay } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";

interface ProfileUser {
  id: string;
  email: string;
  role: string;
  passenger?: { firstName?: string; lastName?: string; phone?: string } | null;
  driver?: { firstName?: string; lastName?: string; phone?: string } | null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const profile = (user as ProfileUser | null);
  const roleProfile = profile?.passenger ?? profile?.driver ?? null;

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(roleProfile?.firstName ?? "");
  const [lastName, setLastName] = useState(roleProfile?.lastName ?? "");
  const [phone, setPhone] = useState(roleProfile?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName =
    [roleProfile?.firstName, roleProfile?.lastName].filter(Boolean).join(" ") ||
    profile?.email.split("@")[0] ||
    "Account";

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<ApiResponse<ProfileUser>>("/api/auth/profile", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      return data.data!;
    },
    onSuccess: (updated) => {
      if (user) {
        setUser({
          ...user,
          firstName: updated.passenger?.firstName ?? updated.driver?.firstName,
          lastName: updated.passenger?.lastName ?? updated.driver?.lastName,
          phone: updated.passenger?.phone ?? updated.driver?.phone,
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
    navigate("/user/passenger/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-slate-50">
      <LoadingOverlay
        show={saveProfile.isPending || uploadAvatar.isPending}
        message="Saving your profile ..."
      />

      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar name={displayName} src={user.avatar} size="xl" />
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
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">{displayName}</h1>
            <p className="text-sm text-slate-500 truncate">{profile?.email}</p>
          </div>
          {!editing && (
            <button
              onClick={() => {
                setFirstName(roleProfile?.firstName ?? "");
                setLastName(roleProfile?.lastName ?? "");
                setPhone(roleProfile?.phone ?? "");
                setEditing(true);
              }}
              className="h-9 px-4 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold hover:bg-primary-100 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Edit profile form */}
        {editing && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Edit Profile</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">First Name</label>
                <div className="relative mt-1">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary-500 focus:bg-white outline-none"
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
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary-500 focus:bg-white outline-none"
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
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary-500 focus:bg-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={profile?.email ?? ""}
                  disabled
                  className="w-full h-10 pl-9 pr-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
            {(saveProfile.isError || uploadAvatar.isError) && (
              <p className="text-xs text-danger-600">Could not save your changes. Please try again.</p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 h-10 bg-slate-100 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveProfile.mutate()}
                disabled={saveProfile.isPending || !firstName.trim()}
                className="flex-1 h-10 bg-primary-600 text-white font-medium rounded-lg text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saveProfile.isPending && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            <CheckCircle2 size={16} />
            Profile updated
          </div>
        )}

        {/* Menu */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Account</h3>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <button
              onClick={() => navigate("/user/passenger/notifications")}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                <Bell size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Notifications</p>
                <p className="text-xs text-slate-400">Trip updates and alerts</p>
              </div>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 h-12 text-red-600 font-semibold bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
