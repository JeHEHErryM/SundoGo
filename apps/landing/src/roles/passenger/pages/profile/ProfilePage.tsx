import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import {
  User, Mail, Phone, LogOut, ChevronRight, Shield, Bell, HelpCircle,
  CreditCard, MapPin, Camera, Edit3, AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "Juan Dela Cruz");
  const [email, setEmail] = useState(user?.email || "juan@example.com");
  const [phone, setPhone] = useState(user?.phone || "+63 917 123 4567");

  const handleLogout = () => {
    logout();
    navigate("/user/passenger/login");
  };

  const menuSections = [
    {
      title: "Account",
      items: [
        { icon: Shield, label: "Safety & Security", desc: "Manage safety features", color: "text-primary-600 bg-primary-50" },
        { icon: Bell, label: "Notifications", desc: "Alert preferences", color: "text-amber-600 bg-amber-50", action: () => navigate("/user/passenger/notifications") },
        { icon: CreditCard, label: "Payment Methods", desc: "Manage payment options", color: "text-green-600 bg-green-50" },
        { icon: MapPin, label: "Saved Places", desc: "Home, work, favorites", color: "text-purple-600 bg-purple-50" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", desc: "FAQs and support", color: "text-cyan-600 bg-cyan-50" },
        { icon: AlertCircle, label: "Report Issue", desc: "Something went wrong?", color: "text-red-600 bg-red-50" },
      ],
    },
  ];

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-xl font-bold text-primary-600">
              {name.charAt(0)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">{name}</h1>
            <p className="text-sm text-slate-500">{email}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"
          >
            <Edit3 size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Edit profile form */}
        {editing && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Edit Profile</h3>
            <div>
              <label className="text-xs text-slate-500">Name</label>
              <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Phone</label>
              <div className="relative mt-1">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>
            <button
              onClick={() => setEditing(false)}
              className="w-full h-10 bg-primary-600 text-white font-medium rounded-lg text-sm hover:bg-primary-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Menu sections */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">{section.title}</h3>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left ${
                    i < section.items.length - 1 ? "border-b border-slate-50" : ""
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                    <item.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Emergency contacts */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Emergency</h3>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Emergency Contacts</p>
                <p className="text-xs text-slate-400">People to notify during trips</p>
              </div>
            </div>
            <button className="w-full h-10 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 font-medium hover:bg-slate-100 transition-colors">
              + Add Emergency Contact
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
