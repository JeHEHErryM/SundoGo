import {
  UserRole,
  DriverVerificationStatus,
  DriverAvailabilityStatus,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  TripStatus,
  NotificationType,
} from './enums';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Passenger {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  id: string;
  passengerId: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: Date;
}

export interface Driver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  verificationStatus: DriverVerificationStatus;
  availabilityStatus: DriverAvailabilityStatus;
  currentLat?: number;
  currentLng?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverVerification {
  id: string;
  driverId: string;
  idImageUrl: string;
  licenseImageUrl: string;
  orcrImageUrl: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  driverId: string;
  plateNumber: string;
  model: string;
  color: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverAvailability {
  id: string;
  driverId: string;
  status: DriverAvailabilityStatus;
  lastLocationUpdate?: Date;
  updatedAt: Date;
}

export interface ServiceArea {
  id: string;
  name: string;
  enabled: boolean;
  geofence: unknown;
  maxBookingRadiusKm: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FareConfiguration {
  id: string;
  serviceAreaId: string;
  baseFare: number;
  perKmRate: number;
  platformFee: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PickupFeeRule {
  id: string;
  serviceAreaId: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  fee: number;
  createdAt: Date;
}

export interface Booking {
  id: string;
  passengerId: string;
  driverId?: string;
  serviceAreaId: string;
  status: BookingStatus;
  pickupLat: number;
  pickupLng: number;
  pickupAddress?: string;
  destinationLat: number;
  destinationLng: number;
  destinationAddress?: string;
  tripDistanceKm: number;
  pickupDistanceKm?: number;
  tripFare: number;
  pickupFee: number;
  platformFee: number;
  totalFare: number;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trip {
  id: string;
  bookingId: string;
  driverId: string;
  passengerId: string;
  status: TripStatus;
  startedAt?: Date;
  completedAt?: Date;
  actualDistanceKm?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationHistory {
  id: string;
  tripId: string;
  lat: number;
  lng: number;
  speed?: number;
  recordedAt: Date;
}

export interface StatusHistory {
  id: string;
  bookingId: string;
  status: BookingStatus;
  changedBy?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  tripId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  passengerId: string;
  driverId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
