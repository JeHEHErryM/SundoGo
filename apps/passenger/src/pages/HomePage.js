import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { Search, Clock, Star, Shield, ChevronRight } from "lucide-react";
import Map from "@/components/Map";
const recentDestinations = [
    { id: "1", address: "SM City Cebu", detail: "Juana Osmeña St, Cebu City", icon: "🏢" },
    { id: "2", address: "Cebu IT Park", detail: "Natalio Bacalso Ave, Cebu City", icon: "💻" },
    { id: "3", address: "Carbon Market", detail: "Magsaysay St, Cebu City", icon: "🛒" },
];
const quickActions = [
    { label: "Send Package", icon: "📦", color: "bg-amber-50 text-amber-600" },
    { label: "Schedule Ride", icon: "📅", color: "bg-purple-50 text-purple-600" },
    { label: "Share Location", icon: "📍", color: "bg-green-50 text-green-600" },
];
export default function HomePage() {
    const navigate = useNavigate();
    const setDestination = useBookingStore((s) => s.setDestination);
    const handleDestinationSelect = (address, detail) => {
        setDestination({ lat: 10.3157, lng: 123.8854, address, detail });
        navigate("/booking");
    };
    return (_jsxs("div", { className: "min-h-dvh bg-slate-50", children: [_jsxs("div", { className: "relative h-[45dvh]", children: [_jsx(Map, { className: "w-full h-full" }), _jsx("div", { className: "absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" })] }), _jsxs("div", { className: "relative -mt-6 px-4 space-y-4", children: [_jsxs("button", { onClick: () => navigate("/booking"), className: "w-full flex items-center gap-3 h-14 px-4 bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 hover:shadow-xl transition-shadow text-left", children: [_jsx("div", { className: "w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0", children: _jsx(Search, { size: 18, className: "text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-900", children: "Where to?" }), _jsx("p", { className: "text-xs text-slate-400", children: "Search destination" })] })] }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: quickActions.map((action) => (_jsxs("button", { className: `flex flex-col items-center gap-1.5 p-3 rounded-2xl ${action.color} transition-transform active:scale-95`, children: [_jsx("span", { className: "text-2xl", children: action.icon }), _jsx("span", { className: "text-xs font-medium", children: action.label })] }, action.label))) }), _jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden", children: [_jsxs("div", { className: "px-4 pt-4 pb-2 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { size: 16, className: "text-slate-400" }), _jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "Recent Destinations" })] }), _jsx("button", { className: "text-xs text-blue-600 font-medium", children: "See all" })] }), recentDestinations.map((dest, i) => (_jsxs("button", { onClick: () => handleDestinationSelect(dest.address, dest.detail), className: `w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${i < recentDestinations.length - 1 ? "border-b border-slate-50" : ""}`, children: [_jsx("span", { className: "text-lg", children: dest.icon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-slate-900 truncate", children: dest.address }), _jsx("p", { className: "text-xs text-slate-400 truncate", children: dest.detail })] }), _jsx(ChevronRight, { size: 16, className: "text-slate-300 shrink-0" })] }, dest.id)))] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-blue-50 rounded-2xl", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0", children: _jsx(Shield, { size: 18, className: "text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-900", children: "Your safety matters" }), _jsx("p", { className: "text-xs text-blue-600/70", children: "All trips are tracked and drivers are verified" })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-cyan-500 p-4 rounded-2xl text-white mb-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Star, { size: 16, className: "text-yellow-300", fill: "currentColor" }), _jsx("span", { className: "text-sm font-bold", children: "50% OFF" })] }), _jsx("p", { className: "text-sm font-medium", children: "First ride discount!" }), _jsx("p", { className: "text-xs opacity-80", children: "Use code SUNDogo50 at checkout" })] })] })] }));
}
