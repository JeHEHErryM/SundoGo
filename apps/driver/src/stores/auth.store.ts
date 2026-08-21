import { create } from "zustand";
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
  consumeUrlToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const raw = localStorage.getItem("driver_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("driver_token"),
  vehicle: (() => {
    try {
      const raw = localStorage.getItem("driver_vehicle");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem("driver_token"),

  login: (user, token, vehicle) => {
    localStorage.setItem("driver_token", token);
    localStorage.setItem("driver_user", JSON.stringify(user));
    if (vehicle) {
      localStorage.setItem("driver_vehicle", JSON.stringify(vehicle));
    }
    set({ user, token, vehicle: vehicle ?? null, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("driver_token");
    localStorage.removeItem("driver_user");
    localStorage.removeItem("driver_vehicle");
    set({ user: null, token: null, vehicle: null, isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem("driver_user", JSON.stringify(user));
    set({ user });
  },

  setVehicle: (vehicle) => {
    localStorage.setItem("driver_vehicle", JSON.stringify(vehicle));
    set({ vehicle });
  },

  consumeUrlToken: () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as Driver;
        localStorage.setItem("driver_token", token);
        localStorage.setItem("driver_user", userStr);
        set({ user, token, isAuthenticated: true });
        window.history.replaceState({}, "", window.location.pathname);
      } catch {
        // ignore
      }
    }
  },
}));
