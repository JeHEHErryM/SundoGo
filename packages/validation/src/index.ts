import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Invalid phone number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const driverRegisterSchema = registerSchema.extend({
  plateNumber: z.string().min(1, 'Plate number is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleColor: z.string().min(1, 'Vehicle color is required'),
});

export const bookingSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  pickupAddress: z.string().optional(),
  destinationLat: z.number().min(-90).max(90),
  destinationLng: z.number().min(-180).max(180),
  destinationAddress: z.string().optional(),
});

export const ratingSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Invalid phone number'),
  relationship: z.string().min(1, 'Relationship is required'),
});

export const fareConfigSchema = z.object({
  serviceAreaId: z.string().uuid(),
  baseFare: z.number().min(0),
  perKmRate: z.number().min(0),
  platformFee: z.number().min(0),
  active: z.boolean(),
});

export const pickupFeeRuleSchema = z.object({
  serviceAreaId: z.string().uuid(),
  minDistanceKm: z.number().min(0),
  maxDistanceKm: z.number().min(0),
  fee: z.number().min(0),
});

export const serviceAreaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  enabled: z.boolean(),
  geofence: z.unknown(),
  maxBookingRadiusKm: z.number().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DriverRegisterInput = z.infer<typeof driverRegisterSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
export type FareConfigInput = z.infer<typeof fareConfigSchema>;
export type PickupFeeRuleInput = z.infer<typeof pickupFeeRuleSchema>;
export type ServiceAreaInput = z.infer<typeof serviceAreaSchema>;
