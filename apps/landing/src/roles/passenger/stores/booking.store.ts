import { create } from "zustand";

interface Location {
  lat: number;
  lng: number;
  address: string;
  detail?: string;
}

interface FareEstimate {
  tripFare: number;
  pickupFee: number;
  platformFee: number;
  total: number;
}

interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  vehicleType: string;
  plateNumber: string;
  rating: number;
  location?: { lat: number; lng: number };
}

type BookingStatus =
  | "idle"
  | "selecting"
  | "fare_estimate"
  | "searching"
  | "driver_accepted"
  | "arriving"
  | "in_transit"
  | "completed"
  | "payment"
  | "rating";

interface BookingState {
  pickup: Location | null;
  destination: Location | null;
  currentBooking: string | null;
  bookingStatus: BookingStatus;
  driverInfo: DriverInfo | null;
  fareEstimate: FareEstimate | null;
  tripDistance: number;
  tripDuration: number;
  setPickup: (location: Location) => void;
  setDestination: (location: Location) => void;
  clearBooking: () => void;
  setBookingStatus: (status: BookingStatus) => void;
  setDriverInfo: (driver: DriverInfo) => void;
  setFareEstimate: (fare: FareEstimate) => void;
  setCurrentBooking: (id: string) => void;
  setTripInfo: (distance: number, duration: number) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  pickup: null,
  destination: null,
  currentBooking: null,
  bookingStatus: "idle",
  driverInfo: null,
  fareEstimate: null,
  tripDistance: 0,
  tripDuration: 0,

  setPickup: (location) => set({ pickup: location }),
  setDestination: (location) => set({ destination: location }),
  clearBooking: () =>
    set({
      pickup: null,
      destination: null,
      currentBooking: null,
      bookingStatus: "idle",
      driverInfo: null,
      fareEstimate: null,
      tripDistance: 0,
      tripDuration: 0,
    }),
  setBookingStatus: (status) => set({ bookingStatus: status }),
  setDriverInfo: (driver) => set({ driverInfo: driver }),
  setFareEstimate: (fare) => set({ fareEstimate: fare }),
  setCurrentBooking: (id) => set({ currentBooking: id }),
  setTripInfo: (distance, duration) => set({ tripDistance: distance, tripDuration: duration }),
}));
