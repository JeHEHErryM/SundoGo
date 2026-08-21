import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket, BOOKING_EVENTS } from "@/lib/socket";
import { useDriverStore } from "@/stores/driver.store";
import type { ApiResponse, Booking } from "@sundogo/types";

/**
 * Listens for booking offers via socket push (with an initial fetch fallback
 * for offers missed while disconnected) and routes the driver to the
 * request screen when one arrives.
 */
export function useOfferListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isOnline = useDriverStore((s) => s.isOnline);
  const setPendingOffer = useDriverStore((s) => s.setPendingOffer);

  useEffect(() => {
    if (!isOnline) return;

    // Catch any offer that arrived while we were disconnected.
    api
      .get<ApiResponse<Booking | null>>("/api/bookings/offers/pending")
      .then(({ data }) => {
        const offer = data.data ?? null;
        setPendingOffer(offer);
        if (offer && !location.pathname.startsWith("/user/driver/booking/")) {
          navigate("/user/driver/booking/request", { replace: true });
        }
      })
      .catch(() => undefined);

    const socket = getSocket();
    const onOffer = () => {
      void queryClient.invalidateQueries({ queryKey: ["driver", "pending-offer"] });
      navigate("/user/driver/booking/request");
    };

    socket.on(BOOKING_EVENTS.OFFER, onOffer);
    return () => {
      socket.off(BOOKING_EVENTS.OFFER, onOffer);
    };
  }, [isOnline]);
}
