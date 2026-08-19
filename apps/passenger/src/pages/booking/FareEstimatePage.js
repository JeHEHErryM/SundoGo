import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { ArrowLeft, Clock, Route, DollarSign } from "lucide-react";
export default function FareEstimatePage() {
    const navigate = useNavigate();
    const { pickup, destination, fareEstimate, setFareEstimate, setBookingStatus, setTripInfo } = useBookingStore();
    useEffect(() => {
        if (!pickup || !destination) {
            navigate("/booking");
            return;
        }
        // Simulate fare calculation
        const distance = 2.5 + Math.random() * 5;
        const duration = Math.round(distance * 4);
        setTripInfo(Math.round(distance * 10) / 10, duration);
        setFareEstimate({
            tripFare: Math.round(distance * 15 * 100) / 100,
            pickupFee: 15,
            platformFee: 10,
            total: 0,
        });
    }, [pickup, destination, navigate, setFareEstimate, setTripInfo]);
    useEffect(() => {
        if (fareEstimate) {
            const updated = { ...fareEstimate, total: fareEstimate.tripFare + fareEstimate.pickupFee + fareEstimate.platformFee };
            if (fareEstimate.total !== updated.total) {
                setFareEstimate(updated);
            }
        }
    }, [fareEstimate, setFareEstimate]);
    const handleConfirm = () => {
        setBookingStatus("searching");
        navigate("/booking/searching");
    };
    if (!pickup || !destination || !fareEstimate)
        return null;
    return (_jsxs("div", { className: "min-h-dvh bg-white flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100", children: [_jsx("button", { onClick: () => navigate(-1), className: "w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100", children: _jsx(ArrowLeft, { size: 20, className: "text-slate-700" }) }), _jsx("h1", { className: "text-lg font-bold text-slate-900", children: "Fare Estimate" })] }), _jsxs("div", { className: "flex-1 px-5 py-6 space-y-5 overflow-y-auto", children: [_jsx("div", { className: "bg-slate-50 rounded-2xl p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsxs("div", { className: "flex flex-col items-center gap-0.5 mt-0.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-600" }), _jsx("div", { className: "w-0.5 h-8 bg-slate-300" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-emerald-600" })] }), _jsxs("div", { className: "flex-1 space-y-4 min-w-0", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-medium text-slate-400 uppercase tracking-wide", children: "Pickup" }), _jsx("p", { className: "text-sm font-medium text-slate-900 truncate", children: pickup.address })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-medium text-slate-400 uppercase tracking-wide", children: "Destination" }), _jsx("p", { className: "text-sm font-medium text-slate-900 truncate", children: destination.address })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "flex items-center gap-3 bg-slate-50 p-3 rounded-xl", children: [_jsx("div", { className: "w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Route, { size: 16, className: "text-blue-600" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-bold text-slate-900", children: [useBookingStore.getState().tripDistance, " km"] }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Distance" })] })] }), _jsxs("div", { className: "flex items-center gap-3 bg-slate-50 p-3 rounded-xl", children: [_jsx("div", { className: "w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center", children: _jsx(Clock, { size: 16, className: "text-amber-600" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-bold text-slate-900", children: [useBookingStore.getState().tripDuration, " min"] }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Est. Time" })] })] })] }), _jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl overflow-hidden", children: [_jsx("div", { className: "px-4 pt-4 pb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { size: 16, className: "text-blue-600" }), _jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "Fare Breakdown" })] }) }), _jsxs("div", { className: "px-4 pb-4 space-y-2.5", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-500", children: "Trip Fare" }), _jsxs("span", { className: "font-medium text-slate-900", children: ["\u20B1", fareEstimate.tripFare.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-500", children: "Pickup Fee" }), _jsxs("span", { className: "font-medium text-slate-900", children: ["\u20B1", fareEstimate.pickupFee.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-500", children: "Platform Fee" }), _jsxs("span", { className: "font-medium text-slate-900", children: ["\u20B1", fareEstimate.platformFee.toFixed(2)] })] }), _jsxs("div", { className: "border-t border-slate-100 pt-2.5 flex justify-between", children: [_jsx("span", { className: "text-sm font-bold text-slate-900", children: "Total" }), _jsxs("span", { className: "text-xl font-bold text-blue-600", children: ["\u20B1", fareEstimate.total.toFixed(2)] })] })] })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-blue-50 rounded-2xl", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDEFA" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-slate-900", children: "Tricycle" }), _jsx("p", { className: "text-xs text-slate-500", children: "Affordable & convenient local transport" })] })] })] }), _jsx("div", { className: "px-5 pb-8 pt-4 border-t border-slate-100 bg-white", children: _jsxs("button", { onClick: handleConfirm, className: "w-full h-13 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/25 text-[15px]", children: ["Confirm Booking \u2014 \u20B1", fareEstimate.total.toFixed(2)] }) })] }));
}
