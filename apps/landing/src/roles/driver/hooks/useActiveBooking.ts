import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useDriverStore } from "@/stores/driver.store";
import type { ApiResponse, Booking } from "@sundogo/types";

type ActiveBooking = Booking & {
  passenger?: { firstName: string; lastName: string; phone: string; avatarUrl?: string } | null;
};

/**
 * Source of truth for the driver's in-progress booking (ACCEPTED through
 * IN_PROGRESS). Falls back to the server so a refresh doesn't lose state.
 */
export function useActiveBooking() {
  const currentBooking = useDriverStore((s) => s.currentBooking);

  return useQuery<ActiveBooking | null>({
    queryKey: ["driver", "active-booking"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ActiveBooking | null>>("/api/bookings/active");
      return data.data ?? null;
    },
    initialData: currentBooking ?? undefined,
    refetchInterval: 10000,
  });
}

export type { ActiveBooking };
