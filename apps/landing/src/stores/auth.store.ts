import { create } from "zustand";
import api from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "PASSENGER" | "DRIVER" | "ADMIN";
  avatar?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ role: string }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "PASSENGER" | "DRIVER";
  }) => Promise<{ role: string }>;
  logout: () => void;
  loadFromStorage: () => void;
  consumeUrlToken: () => void;
}

const TOKEN_KEY = "sundogo_token";
const USER_KEY = "sundogo_user";

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      const user: User = data.user;
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({
        user,
        token: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return { role: user.role };
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
          role: regData.role,
        });
      const user: User = data.user;
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({
        user,
        token: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return { role: user.role };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = readStoredUser();
    if (token && user) {
      set({ user, token, isAuthenticated: true });
    }
  },

  consumeUrlToken: () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, userStr);
        set({ user, token, isAuthenticated: true });
        window.history.replaceState({}, "", window.location.pathname);
      } catch {
        // ignore
      }
    }
  },
}));
