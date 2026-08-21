import { create } from "zustand";
import api from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  consumeUrlToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.accessToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (regData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/api/auth/register", {
        email: regData.email,
        password: regData.password,
        firstName: regData.name.split(" ")[0] || regData.name,
        lastName: regData.name.split(" ").slice(1).join(" ") || " ",
        phone: regData.phone,
        role: "PASSENGER",
      });
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.accessToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  },

  consumeUrlToken: () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        localStorage.setItem("token", token);
        localStorage.setItem("user", userStr);
        set({ user, token, isAuthenticated: true });
        window.history.replaceState({}, "", window.location.pathname);
      } catch {
        // ignore
      }
    }
  },
}));
