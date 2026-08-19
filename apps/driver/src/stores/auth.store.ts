import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Driver, Vehicle } from "@sundogo/types";

interface AuthState {
  user: Driver | null;
  token: string | null;
  vehicle: Vehicle | null;
  isAuthenticated: boolean;
  login: (user: Driver, token: string, vehicle?: Vehicle) => void;
  logout: () => void;
  setUser: (user: Driver) => void;
  setVehicle: (vehicle: Vehicle) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      vehicle: null,
      isAuthenticated: false,
      login: (user, token, vehicle) =>
        set({ user, token, vehicle: vehicle ?? null, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, vehicle: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
      setVehicle: (vehicle) => set({ vehicle }),
    }),
    { name: "driver-auth" }
  )
);
