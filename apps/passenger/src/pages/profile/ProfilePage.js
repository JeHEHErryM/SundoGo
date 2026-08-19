import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { User, Mail, Phone, LogOut, ChevronRight, Shield, Bell, HelpCircle, CreditCard, MapPin, Camera, Edit3, AlertCircle, } from "lucide-react";
export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || "Juan Dela Cruz");
    const [email, setEmail] = useState(user?.email || "juan@example.com");
    const [phone, setPhone] = useState(user?.phone || "+63 917 123 4567");
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const menuSections = [
        {
            title: "Account",
            items: [
                { icon: Shield, label: "Safety & Security", desc: "Manage safety features", color: "text-blue-600 bg-blue-50" },
                { icon: Bell, label: "Notifications", desc: "Alert preferences", color: "text-amber-600 bg-amber-50", action: () => navigate("/notifications") },
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
    return (_jsxs("div", { className: "min-h-dvh bg-slate-50", children: [_jsx("div", { className: "bg-white px-5 pt-6 pb-5 border-b border-slate-100", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600", children: name.charAt(0) }), _jsx("button", { className: "absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white", children: _jsx(Camera, { size: 12, className: "text-white" }) })] }), _jsxs("div", { className: "flex-1", children: [_jsx("h1", { className: "text-lg font-bold text-slate-900", children: name }), _jsx("p", { className: "text-sm text-slate-500", children: email })] }), _jsx("button", { onClick: () => setEditing(!editing), className: "w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center", children: _jsx(Edit3, { size: 16, className: "text-slate-600" }) })] }) }), _jsxs("div", { className: "px-5 py-4 space-y-4", children: [editing && (_jsxs("div", { className: "bg-white rounded-2xl p-4 border border-slate-100 space-y-3", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "Edit Profile" }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-slate-500", children: "Name" }), _jsxs("div", { className: "relative mt-1", children: [_jsx(User, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:bg-white" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-slate-500", children: "Email" }), _jsxs("div", { className: "relative mt-1", children: [_jsx(Mail, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), className: "w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:bg-white" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-slate-500", children: "Phone" }), _jsxs("div", { className: "relative mt-1", children: [_jsx(Phone, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), className: "w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:bg-white" })] })] }), _jsx("button", { onClick: () => setEditing(false), className: "w-full h-10 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors", children: "Save Changes" })] })), menuSections.map((section) => (_jsxs("div", { children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1", children: section.title }), _jsx("div", { className: "bg-white rounded-2xl border border-slate-100 overflow-hidden", children: section.items.map((item, i) => (_jsxs("button", { onClick: item.action, className: `w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left ${i < section.items.length - 1 ? "border-b border-slate-50" : ""}`, children: [_jsx("div", { className: `w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`, children: _jsx(item.icon, { size: 16 }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-slate-900", children: item.label }), _jsx("p", { className: "text-xs text-slate-400", children: item.desc })] }), _jsx(ChevronRight, { size: 16, className: "text-slate-300" })] }, item.label))) })] }, section.title))), _jsxs("div", { children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1", children: "Emergency" }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-100 p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center", children: _jsx(Shield, { size: 16, className: "text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-900", children: "Emergency Contacts" }), _jsx("p", { className: "text-xs text-slate-400", children: "People to notify during trips" })] })] }), _jsx("button", { className: "w-full h-10 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 font-medium hover:bg-slate-100 transition-colors", children: "+ Add Emergency Contact" })] })] }), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center justify-center gap-2 h-12 text-red-600 font-semibold bg-red-50 rounded-2xl hover:bg-red-100 transition-colors", children: [_jsx(LogOut, { size: 18 }), "Sign Out"] })] })] }));
}
