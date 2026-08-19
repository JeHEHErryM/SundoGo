import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { X } from "lucide-react";

export default function SearchingDriverPage() {
  const navigate = useNavigate();
  const { setBookingStatus, setDriverInfo } = useBookingStore();
  const [dots, setDots] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    const timerInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    // Simulate finding a driver after 3-5 seconds
    const timeout = setTimeout(() => {
      setDriverInfo({
        id: "driver-1",
        name: "Mang Rodel",
        phone: "+63 917 123 4567",
        vehicleType: "Tricycle",
        plateNumber: "GDY 1234",
        rating: 4.8,
        location: { lat: 10.3157, lng: 123.8854 },
      });
      setBookingStatus("driver_accepted");
      navigate("/booking/driver-accepted");
    }, 3000 + Math.random() * 2000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(timerInterval);
      clearTimeout(timeout);
    };
  }, [navigate, setBookingStatus, setDriverInfo]);

  const handleCancel = () => {
    useBookingStore.getState().clearBooking();
    navigate("/");
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-600 to-blue-700 flex flex-col items-center justify-center px-6 text-white">
      {/* Cancel button */}
      <button
        onClick={handleCancel}
        className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
      >
        <X size={20} />
      </button>

      {/* Loading animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">🛺</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">Looking for a driver{dots}</h2>
      <p className="text-blue-100 text-sm mb-8">This usually takes less than a minute</p>

      {/* Progress indicator */}
      <div className="w-full max-w-xs">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((elapsed / 10) * 100, 95)}%` }}
          />
        </div>
        <p className="text-center text-xs text-blue-200 mt-2">Searching nearby drivers...</p>
      </div>
    </div>
  );
}
