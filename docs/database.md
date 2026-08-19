# SundoGo Database Schema

PostgreSQL via Prisma ORM. Schema defined in `services/api/prisma/schema.prisma`.

---

## Enums

| Enum | Values | Table Map |
|------|--------|-----------|
| UserRole | `PASSENGER`, `DRIVER`, `ADMIN` | `user_role` |
| DriverVerificationStatus | `PENDING`, `APPROVED`, `REJECTED` | `driver_verification_status` |
| DriverAvailabilityStatus | `OFFLINE`, `ONLINE`, `ON_TRIP` | `driver_availability_status` |
| BookingStatus | `REQUESTED`, `SEARCHING`, `ACCEPTED`, `DRIVER_ARRIVING`, `DRIVER_ARRIVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | `booking_status` |
| PaymentMethod | `CASH`, `GCASH`, `OTHER` | `payment_method` |
| PaymentStatus | `PENDING`, `PAID`, `FAILED`, `REFUNDED` | `payment_status` |
| TripStatus | `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | `trip_status` |
| NotificationType | `BOOKING_ACCEPTED`, `DRIVER_ARRIVING`, `DRIVER_ARRIVED`, `TRIP_STARTED`, `TRIP_COMPLETED`, `BOOKING_CANCELLED`, `EMERGENCY_ALERT` | `notification_type` |

---

## Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| email | String | Unique, indexed |
| passwordHash | String | bcrypt hash |
| role | UserRole | Default: `PASSENGER`, indexed |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relations:** `passenger?`, `driver?`, `notifications[]`

### Passenger
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| userId | String | Unique, FK → User (cascade delete) |
| firstName | String | |
| lastName | String | |
| phone | String | |
| avatarUrl | String? | |
| createdAt / updatedAt | DateTime | |

**Relations:** `user`, `emergencyContacts[]`, `bookings[]`, `trips[]`, `reviews[]`

### Driver
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| userId | String | Unique, FK → User (cascade delete) |
| firstName | String | |
| lastName | String | |
| phone | String | |
| avatarUrl | String? | |
| currentLat | Decimal(9,6)? | GPS latitude |
| currentLng | Decimal(9,6)? | GPS longitude |
| createdAt / updatedAt | DateTime | |

**Relations:** `user`, `verification?`, `vehicle?`, `availability?`, `bookings[]`, `trips[]`, `reviews[]`

### DriverVerification
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| driverId | String | Unique, FK → Driver (cascade delete) |
| idDocumentUrl | String | |
| licenseUrl | String | |
| vehicleRegistrationUrl | String | |
| status | DriverVerificationStatus | Default: `PENDING` |
| notes | String? | Admin rejection reason |
| reviewedBy | String? | Admin user ID |
| reviewedAt | DateTime? | |
| createdAt / updatedAt | DateTime | |

### Vehicle
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| driverId | String | Unique, FK → Driver (cascade delete) |
| plateNumber | String | |
| model | String | |
| color | String | |
| imageUrl | String? | |
| createdAt / updatedAt | DateTime | |

### DriverAvailability
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| driverId | String | Unique, FK → Driver (cascade delete) |
| status | DriverAvailabilityStatus | Default: `OFFLINE` |
| lastLocationUpdate | DateTime? | |
| updatedAt | DateTime | |

### ServiceArea
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | String | |
| enabled | Boolean | Default: `true` |
| geofence | Json | GeoJSON polygon |
| maxBookingRadiusKm | Decimal(6,2) | |
| createdAt / updatedAt | DateTime | |

**Relations:** `fareConfigurations[]`, `pickupFeeRules[]`, `bookings[]`

### FareConfiguration
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| serviceAreaId | String | FK → ServiceArea (cascade delete), indexed |
| baseFare | Decimal(8,2) | |
| perKmRate | Decimal(8,2) | |
| platformFee | Decimal(8,2) | |
| active | Boolean | Default: `true`, indexed |
| createdAt / updatedAt | DateTime | |

### PickupFeeRule
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| serviceAreaId | String | FK → ServiceArea (cascade delete), indexed |
| minDistanceKm | Decimal(6,2) | |
| maxDistanceKm | Decimal(6,2) | |
| fee | Decimal(8,2) | |
| createdAt | DateTime | |

### Booking
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| passengerId | String | FK → Passenger (restrict), indexed |
| driverId | String? | FK → Driver (set null), indexed |
| serviceAreaId | String | FK → ServiceArea (restrict) |
| status | BookingStatus | Default: `REQUESTED`, indexed |
| pickupLat / pickupLng | Decimal(9,6) | |
| pickupAddress | String? | |
| destinationLat / destinationLng | Decimal(9,6) | |
| destinationAddress | String? | |
| tripDistanceKm | Decimal(6,2) | |
| pickupDistanceKm | Decimal(6,2)? | |
| tripFare | Decimal(8,2) | |
| pickupFee | Decimal(8,2) | |
| platformFee | Decimal(8,2) | |
| totalFare | Decimal(8,2) | |
| cancelledAt | DateTime? | |
| cancelReason | String? | |
| createdAt | DateTime | Indexed |
| updatedAt | DateTime | |

**Relations:** `passenger`, `driver?`, `serviceArea`, `trip?`, `statusHistory[]`, `payment?`, `review?`

### Trip
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| bookingId | String | Unique, FK → Booking (cascade delete) |
| driverId | String | FK → Driver (restrict), indexed |
| passengerId | String | FK → Passenger (restrict), indexed |
| status | TripStatus | Default: `IN_PROGRESS`, indexed |
| startedAt | DateTime? | |
| completedAt | DateTime? | |
| actualDistanceKm | Decimal(6,2)? | |
| createdAt / updatedAt | DateTime | |

**Relations:** `booking`, `driver`, `passenger`, `locationHistory[]`, `payment?`

### LocationHistory
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| tripId | String | FK → Trip (cascade delete), indexed |
| lat | Decimal(9,6) | |
| lng | Decimal(9,6) | |
| speed | Decimal(5,2)? | |
| recordedAt | DateTime | Indexed |

### StatusHistory
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| bookingId | String | FK → Booking (cascade delete), indexed |
| status | BookingStatus | |
| changedBy | String? | User ID who triggered change |
| createdAt | DateTime | |

### Payment
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| bookingId | String | Unique, FK → Booking (cascade delete) |
| tripId | String | Unique, FK → Trip (restrict) |
| amount | Decimal(8,2) | |
| method | PaymentMethod | |
| status | PaymentStatus | Default: `PENDING` |
| createdAt / updatedAt | DateTime | |

### Notification
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| userId | String | FK → User (cascade delete), indexed |
| type | NotificationType | |
| title | String | |
| body | String | |
| data | Json? | Arbitrary payload |
| read | Boolean | Default: `false`, indexed |
| createdAt | DateTime | |

### Review
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| bookingId | String | Unique, FK → Booking (cascade delete) |
| passengerId | String | FK → Passenger (restrict) |
| driverId | String | FK → Driver (restrict) |
| rating | Int | 1-5 |
| comment | String? | |
| createdAt | DateTime | |

---

## Key Relationships

```
User 1──1 Passenger ──┬── many Booking
                      ├── many Trip
                      ├── many Review
                      └── many EmergencyContact

User 1──1 Driver ─────┬── 1 Verification
                      ├── 1 Vehicle
                      ├── 1 Availability
                      ├── many Booking
                      ├── many Trip
                      └── many Review

ServiceArea ──┬── many FareConfiguration
              ├── many PickupFeeRule
              └── many Booking

Booking 1──1 Trip ──┬── many LocationHistory
                    └── 1 Payment

Booking 1──1 Payment
Booking 1──1 Review
Booking many──many StatusHistory
```

## Key Indexes

- `users`: email (unique), role
- `bookings`: status, passengerId, driverId, createdAt
- `trips`: driverId, passengerId, status
- `fare_configurations`: serviceAreaId, active
- `pickup_fee_rules`: serviceAreaId
- `location_history`: tripId, recordedAt
- `status_history`: bookingId
- `emergency_contacts`: passengerId
- `notifications`: userId, read
