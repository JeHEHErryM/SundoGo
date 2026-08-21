import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "../../stores/booking.store";
import { CheckCircle2, Banknote, Home, Clock, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Avatar } from "@/components/shared";
import type { ApiResponse } from "@sundogo/types";

interface PaymentDetail {
  id: string;
  amount: string | number;
  method: string;
  status: string;
}

export default function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const { currentBooking, driverInfo, clearBooking } = useBookingStore();

  const { data: payment, isLoading } = useQuery({
    queryKey: ["passenger", "payment", currentBooking],
    enabled: !!currentBooking,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaymentDetail | null>>(
        `/api/payments/booking/${currentBooking}`,
      );
      return data.data ?? null;
    },
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 5000 : false),
  });

  const handleDone = () => {
    clearBooking();
    navigate("/user/passenger/", { replace: true });
  };

  if (!currentBooking || isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-primary-600" />
      </div>
    );
  }

  const isPaid = payment?.status === "PAID";

  if (isPaid) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Confirmed</h1>
        <p className="text-slate-500 text-sm mb-2">Cash payment of</p>
        <p className="text-3xl font-bold text-slate-900 mb-6">
          ₱{Number(payment!.amount).toFixed(2)}
        </p>
        {driverInfo && <p className="text-sm text-slate-500 mb-8">Paid to {driverInfo.name}</p>}

        <button
          onClick={handleDone}
          className="press w-full max-w-xs h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <Home size={18} />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Banknote size={28} className="text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Cash Payment</h1>
        <p className="text-sm text-slate-500 mt-1">Please pay your driver the exact amount</p>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {/* Amount */}
        <div className="bg-slate-50 rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-500 mb-1">Amount Due</p>
          <p className="text-4xl font-bold text-slate-900">
            ₱{payment ? Number(payment.amount).toFixed(2) : "—"}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <Clock size={12} />
            Awaiting confirmation by your driver
          </p>
        </div>

        {/* Driver */}
        {driverInfo && (
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
            <Avatar name={driverInfo.name} src={driverInfo.avatar} size="md" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{driverInfo.name}</p>
              <p className="text-xs text-slate-500">{driverInfo.vehicleType} • {driverInfo.plateNumber}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 text-center px-4">
          Your driver records the cash payment in their app. This page updates automatically once
          it is confirmed.
        </p>
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={handleDone}
          className="press w-full h-13 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-600/25 text-[15px]"
        >
          <Home size={18} />
          Back to Home
        </button>
      </div>
    </div>
  );
}
