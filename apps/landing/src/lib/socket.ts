import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

/** Returns the shared authenticated socket, connecting lazily on first use. */
export function getSocket(): Socket {
  if (socket?.connected) return socket;

  const token = localStorage.getItem("sundogo_token");
  socket = io(API_URL.replace(/\/$/, ""), {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 2000,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export const BOOKING_EVENTS = {
  OFFER: "booking:offer",
  ACCEPTED: "booking:accepted",
  DRIVER_ARRIVING: "driver:arriving",
  DRIVER_ARRIVED: "driver:arrived",
  TRIP_STARTED: "trip:started",
  TRIP_COMPLETED: "trip:completed",
  CANCELLED: "booking:cancelled",
} as const;
