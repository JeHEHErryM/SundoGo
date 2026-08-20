import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/stores/booking.store";
import { Star, Send, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RatingPage() {
  const navigate = useNavigate();
  const { driverInfo, clearBooking } = useBookingStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    // TODO: POST /api/bookings/${id}/rating
    setSubmitted(true);
  };

  const handleDone = () => {
    clearBooking();
    navigate("/");
  };

  if (submitted) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Thanks for your feedback!</h1>
        <p className="text-slate-500 text-sm mb-8">Your rating helps us improve the service.</p>
        <button
          onClick={handleDone}
          className="w-full max-w-xs h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Rate Your Trip</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 space-y-8">
        {/* Driver */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-xl font-bold text-primary-600 mx-auto mb-3">
            {(driverInfo?.name || "D").charAt(0)}
          </div>
          <p className="font-bold text-slate-900">{driverInfo?.name || "Your Driver"}</p>
          <p className="text-sm text-slate-500">{driverInfo?.vehicleType} • {driverInfo?.plateNumber}</p>
        </div>

        {/* Stars */}
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform active:scale-90"
            >
              <Star
                size={44}
                className={`transition-colors ${
                  star <= (hovered || rating) ? "text-amber-400" : "text-slate-200"
                }`}
                fill={star <= (hovered || rating) ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-sm text-slate-500">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>
        )}

        {/* Comment */}
        <div className="w-full max-w-sm">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment (optional)"
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-primary-500 transition-colors resize-none"
          />
        </div>
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full h-13 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-600/25"
        >
          <Send size={18} />
          Submit Rating
        </button>
      </div>
    </div>
  );
}
