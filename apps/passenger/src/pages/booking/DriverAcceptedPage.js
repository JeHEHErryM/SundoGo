import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { Phone, MessageCircle, Star, Shield, Navigation } from "lucide-react";
import Map from "@/components/Map";
export default function DriverAcceptedPage() {
    const navigate = useNavigate();
    const { driverInfo, pickup, setBookingStatus } = useBookingStore();
    const [eta, setEta] = useState(3);
    useEffect(() => {
        const timer = setInterval(() => {
            setEta((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setBookingStatus("in_transit");
                    navigate("/booking/active");
                    return 0;
                }
                return prev - 1;
            });
        }, 5000);
        return () => clearInterval(timer);
    }, [navigate, setBookingStatus]);
    if (!driverInfo)
        return null;
    return (_jsxs("div", { className: "min-h-dvh flex flex-col bg-white", children: [_jsx("div", { className: "relative h-[45dvh] shrink-0", children: _jsx(Map, { pickup: pickup, driverLocation: driverInfo.location, className: "w-full h-full" }) }), _jsxs("div", { className: "flex-1 px-5 pt-5 pb-8 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 bg-blue-50 px-4 py-2.5 rounded-xl", children: [_jsx("div", { className: "w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm font-semibold text-blue-900", children: "Driver is on the way" }), _jsxs("span", { className: "ml-auto text-sm font-bold text-blue-600", children: [eta, " min"] })] }), _jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600", children: driverInfo.name.charAt(0) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: driverInfo.name }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { size: 12, className: "text-amber-400", fill: "currentColor" }), _jsx("span", { className: "text-xs font-medium text-slate-600", children: driverInfo.rating })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("a", { href: `tel:${driverInfo.phone}`, className: "w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700", children: _jsx(Phone, { size: 16 }) }), _jsx("button", { className: "w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200", children: _jsx(MessageCircle, { size: 16 }) })] })] }), _jsxs("div", { className: "flex items-center gap-3 bg-slate-50 p-3 rounded-xl", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDEFA" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-slate-900", children: driverInfo.vehicleType }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Plate: ", driverInfo.plateNumber] })] }), _jsxs("div", { className: "flex items-center gap-1 text-green-600", children: [_jsx(Shield, { size: 14 }), _jsx("span", { className: "text-xs font-medium", children: "Verified" })] })] })] }), _jsxs("div", { className: "flex items-center gap-3 bg-slate-50 p-3 rounded-xl", children: [_jsx(Navigation, { size: 16, className: "text-blue-600 shrink-0" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-[11px] text-slate-400 uppercase", children: "Pickup Point" }), _jsx("p", { className: "text-sm font-medium text-slate-900 truncate", children: pickup?.address || "Current Location" })] })] })] })] }));
}
