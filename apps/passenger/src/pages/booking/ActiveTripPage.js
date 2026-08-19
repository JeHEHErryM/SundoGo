import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { Phone, MessageCircle, AlertTriangle, Navigation } from "lucide-react";
import Map from "@/components/Map";
export default function ActiveTripPage() {
    const navigate = useNavigate();
    const { driverInfo, pickup, destination, setBookingStatus } = useBookingStore();
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setBookingStatus("completed");
                    navigate("/booking/completed");
                    return 100;
                }
                return prev + 5;
            });
        }, 2000);
        return () => clearInterval(timer);
    }, [navigate, setBookingStatus]);
    if (!driverInfo)
        return null;
    return (_jsxs("div", { className: "min-h-dvh flex flex-col bg-white", children: [_jsx("div", { className: "relative h-[40dvh] shrink-0", children: _jsx(Map, { pickup: pickup, destination: destination, driverLocation: driverInfo.location, className: "w-full h-full", showRoute: true }) }), _jsxs("div", { className: "flex-1 px-5 pt-4 pb-8 space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs text-slate-500 mb-1.5", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Navigation, { size: 12, className: "text-blue-600" }), " ", pickup?.address?.slice(0, 20) || "Pickup"] }), _jsxs("span", { className: "flex items-center gap-1", children: [destination?.address?.slice(0, 20) || "Dest", " ", _jsx(Navigation, { size: 12, className: "text-emerald-600" })] })] }), _jsx("div", { className: "h-1.5 bg-slate-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000", style: { width: `${progress}%` } }) }), _jsxs("p", { className: "text-center text-xs text-slate-400 mt-1", children: [Math.round(progress), "% of trip completed"] })] }), _jsxs("div", { className: "flex items-center gap-2 bg-blue-50 px-4 py-2.5 rounded-xl", children: [_jsx("div", { className: "w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm font-semibold text-blue-900", children: "Trip in progress" })] }), _jsx("div", { className: "bg-white border border-slate-200 rounded-2xl p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600", children: driverInfo.name.charAt(0) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: driverInfo.name }), _jsxs("p", { className: "text-xs text-slate-500", children: [driverInfo.vehicleType, " \u2022 ", driverInfo.plateNumber] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("a", { href: `tel:${driverInfo.phone}`, className: "w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white", children: _jsx(Phone, { size: 16 }) }), _jsx("button", { className: "w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600", children: _jsx(MessageCircle, { size: 16 }) })] })] }) }), _jsxs("button", { className: "w-full flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors", children: [_jsx("div", { className: "w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center", children: _jsx(AlertTriangle, { size: 16, className: "text-red-600" }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-sm font-semibold text-red-900", children: "Emergency" }), _jsx("p", { className: "text-xs text-red-600/70", children: "Tap to alert authorities and contacts" })] })] })] })] }));
}
