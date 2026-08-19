import { create } from "zustand";

interface NotificationsState {
  unreadCount: number;
  increment: () => void;
  markAllRead: () => void;
  setCount: (n: number) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  markAllRead: () => set({ unreadCount: 0 }),
  setCount: (n) => set({ unreadCount: n }),
}));
