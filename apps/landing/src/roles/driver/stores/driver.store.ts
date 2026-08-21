import { create } from "zustand";
import type { Booking, Trip, DriverVerificationStatus, Vehicle } from "@sundogo/types";

interface DriverProfile {
  verificationStatus: DriverVerificationStatus;
  averageRating: number;
  totalTrips: number;
  vehicle?: Vehicle;
}

interface DriverState {
  isOnline: boolean;
  currentBooking: Booking | null;
  activeTrip: Trip | null;
  driverProfile: DriverProfile | null;
  pendingOffer: Booking | null;
  goOnline: () => void;
  goOffline: () => void;
  setDriverProfile: (profile: DriverProfile) => void;
  acceptBooking: (booking: Booking) => void;
  clearBooking: () => void;
  setPendingOffer: (booking: Booking | null) => void;
  startTrip: (trip: Trip) => void;
  arriveAtPickup: () => void;
  setDestinationConfirmed: () => void;
  completeTrip: (trip: Trip) => void;
  clearTrip: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  isOnline: false,
  currentBooking: null,
  activeTrip: null,
  driverProfile: null,
  pendingOffer: null,
  goOnline: () => set({ isOnline: true }),
  goOffline: () => set({ isOnline: false, currentBooking: null, activeTrip: null, pendingOffer: null }),
  setDriverProfile: (profile) => set({ driverProfile: profile }),
  acceptBooking: (booking) => set({ currentBooking: booking, pendingOffer: null }),
  clearBooking: () => set({ currentBooking: null }),
  setPendingOffer: (booking) => set({ pendingOffer: booking }),
  startTrip: (trip) => set({ activeTrip: trip }),
  arriveAtPickup: () => {},
  setDestinationConfirmed: () => {},
  completeTrip: (trip) => set({ activeTrip: trip, currentBooking: null }),
  clearTrip: () => set({ activeTrip: null }),
}));
