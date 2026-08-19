import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { ArrowLeft, MapPin, Navigation, Search, X, LocateFixed } from "lucide-react";
import Map from "@/components/Map";
export default function MapBookingPage() {
    const navigate = useNavigate();
    const { pickup, destination, setPickup, setDestination, setBookingStatus } = useBookingStore();
    const [tab, setTab] = useState(pickup ? "destination" : "pickup");
    const [search, setSearch] = useState("");
    const [simulating, setSimulating] = useState(false);
    const handleSimulateLocation = () => {
        setSimulating(true);
        setTimeout(() => {
            const loc = {
                lat: 10.3157 + (Math.random() - 0.5) * 0.02,
                lng: 123.8854 + (Math.random() - 0.5) * 0.02,
                address: tab === "pickup" ? "Current Location" : search || "Selected Destination",
            };
            if (tab === "pickup") {
                setPickup(loc);
                setTab("destination");
            }
            else {
                setDestination(loc);
            }
            setSimulating(false);
        }, 800);
    };
    const handleConfirm = () => {
        if (pickup && destination) {
            setBookingStatus("fare_estimate");
            navigate("/booking/fare");
        }
    };
    const handleClear = (field) => {
        if (field === "pickup") {
            setPickup(null);
            setTab("pickup");
        }
        else {
            setDestination(null);
            setTab("destination");
        }
    };
    return (_jsxs("div", { className: "min-h-dvh flex flex-col bg-white", children: [_jsxs("div", { className: "relative flex-1 min-h-[40dvh]", children: [_jsx(Map, { pickup: pickup, destination: destination, className: "w-full h-full", showRoute: !!pickup && !!destination }), _jsx("button", { onClick: () => navigate(-1), className: "absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-10", children: _jsx(ArrowLeft, { size: 20, className: "text-slate-700" }) }), _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx(MapPin, { size: 32, className: tab === "pickup" ? "text-blue-600" : "text-emerald-600", fill: tab === "pickup" ? "#2563eb" : "#059669" }), _jsx("div", { className: "w-3 h-1 bg-black/10 rounded-full blur-sm mt-0.5" })] }) })] }), _jsxs("div", { className: "bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-5 pt-5 pb-8 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-600 border-2 border-blue-200" }), _jsx("div", { className: "w-0.5 h-5 bg-slate-200" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-emerald-600 border-2 border-emerald-200" })] }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("button", { onClick: () => setTab("pickup"), className: `w-full flex items-center gap-3 h-11 px-3 rounded-xl border transition-colors ${tab === "pickup" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"}`, children: [pickup ? (_jsx("div", { className: "flex-1 text-left min-w-0", children: _jsx("p", { className: "text-sm font-medium text-slate-900 truncate", children: pickup.address }) })) : (_jsx("span", { className: "text-sm text-slate-400", children: "Pickup location" })), pickup && (_jsx("button", { onClick: (e) => { e.stopPropagation(); handleClear("pickup"); }, className: "p-1 hover:bg-slate-200 rounded-lg", children: _jsx(X, { size: 14, className: "text-slate-400" }) }))] }), _jsxs("button", { onClick: () => setTab("destination"), className: `w-full flex items-center gap-3 h-11 px-3 rounded-xl border transition-colors ${tab === "destination" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50"}`, children: [destination ? (_jsx("div", { className: "flex-1 text-left min-w-0", children: _jsx("p", { className: "text-sm font-medium text-slate-900 truncate", children: destination.address }) })) : (_jsx("span", { className: "text-sm text-slate-400", children: "Where are you going?" })), destination && (_jsx("button", { onClick: (e) => { e.stopPropagation(); handleClear("destination"); }, className: "p-1 hover:bg-slate-200 rounded-lg", children: _jsx(X, { size: 14, className: "text-slate-400" }) }))] })] })] }), (tab === "pickup" && !pickup) || (tab === "destination" && !destination) ? (_jsxs("div", { className: "relative", children: [_jsx(Search, { size: 18, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: tab === "pickup" ? "Search pickup location" : "Search destination", className: "w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-colors", autoFocus: true })] })) : null, _jsx("button", { onClick: handleSimulateLocation, disabled: simulating, className: "w-full h-11 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors text-sm", children: simulating ? (_jsx("div", { className: "w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(LocateFixed, { size: 16 }), tab === "pickup" ? "Use Current Location" : "Pick on Map"] })) }), _jsxs("button", { onClick: handleConfirm, disabled: !pickup || !destination, className: "w-full h-13 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/25 text-[15px]", children: [_jsx(Navigation, { size: 18 }), "Get Fare Estimate"] })] })] }));
}
