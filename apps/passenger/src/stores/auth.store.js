import { create } from "zustand";
import api from "@/lib/api";
export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data } = await api.post("/api/auth/login", { email, password });
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },
    register: async (regData) => {
        set({ isLoading: true });
        try {
            const { data } = await api.post("/api/auth/register", regData);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
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
                const user = JSON.parse(userStr);
                set({ user, token, isAuthenticated: true });
            }
            catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
    },
}));
