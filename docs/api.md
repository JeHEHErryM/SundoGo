# SundoGo API Reference

Base URL: `/api`

All endpoints return `{ success: boolean, data: any }`.

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user (passenger or driver) |
| POST | `/api/auth/login` | No | Login with email/password, returns JWT |
| GET | `/api/auth/profile` | Yes | Get current user profile |

---

## Passengers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/passengers/profile` | Yes (Passenger) | Get current passenger profile |
| PATCH | `/api/passengers/profile` | Yes (Passenger) | Update passenger profile |
| GET | `/api/passengers/emergency-contacts` | Yes (Passenger) | List emergency contacts |
| POST | `/api/passengers/emergency-contacts` | Yes (Passenger) | Add emergency contact |
| DELETE | `/api/passengers/emergency-contacts/:id` | Yes (Passenger) | Remove emergency contact |
| POST | `/api/passengers/emergency-alert` | Yes (Passenger) | Trigger emergency alert during active trip (notifies driver) |
| GET | `/api/passengers/:id` | Yes (Admin) | Get passenger by ID |

---

## Drivers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/drivers/profile` | Yes (Driver) | Get current driver profile |
| PATCH | `/api/drivers/profile` | Yes (Driver) | Update driver profile |
| PATCH | `/api/drivers/location` | Yes (Driver) | Update current GPS location |
| PATCH | `/api/drivers/availability` | Yes (Driver) | Toggle online/offline/on-trip status |
| GET | `/api/drivers/available/:serviceAreaId` | Yes (Admin) | List available drivers in service area |
| GET | `/api/drivers/:id` | Yes (Admin) | Get driver by ID |

---

## Driver Verification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/driver-verification/status` | Yes (Driver) | Get own verification status |
| POST | `/api/driver-verification/submit` | Yes (Driver) | Submit verification documents |
| GET | `/api/driver-verification/pending` | Yes (Admin) | List pending verifications |
| PATCH | `/api/driver-verification/:id/approve` | Yes (Admin) | Approve a verification |
| PATCH | `/api/driver-verification/:id/reject` | Yes (Admin) | Reject a verification with notes |

---

## Vehicles

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/vehicles` | Yes (Driver) | Get own vehicle |
| POST | `/api/vehicles` | Yes (Driver) | Create vehicle (upsert) |
| PATCH | `/api/vehicles/:id` | Yes (Driver) | Update vehicle details |

---

## Bookings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bookings` | Yes (Passenger) | Create a new booking |
| GET | `/api/bookings` | Yes | List own bookings (paginated) |
| GET | `/api/bookings/active` | Yes (Driver) | Get active booking for driver |
| GET | `/api/bookings/:id` | Yes | Get booking by ID |
| POST | `/api/bookings/:id/cancel` | Yes | Cancel a booking with optional reason |
| POST | `/api/bookings/:id/confirm-driver` | Yes (Passenger) | Trigger driver search for booking |
| PATCH | `/api/bookings/:id/status` | Yes (Driver) | Update booking status |

---

## Trips

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/trips` | Yes | List own trips (paginated) |
| GET | `/api/trips/active` | Yes (Driver) | Get active trip for driver |
| GET | `/api/trips/:id` | Yes | Get trip by ID |
| POST | `/api/trips/:id/location` | Yes (Driver) | Record location data point |
| GET | `/api/trips/:id/locations` | Yes | Get trip location history |

---

## Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/payments/booking/:bookingId` | Yes | Get payment for a booking |
| POST | `/api/payments/:bookingId/record` | Yes (Driver) | Record payment (cash/gcash/other) |
| GET | `/api/payments/earnings` | Yes (Driver) | Get driver earnings (date range) |

---

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Yes | List own notifications (paginated) |
| GET | `/api/notifications/unread-count` | Yes | Get unread notification count |
| PATCH | `/api/notifications/:id/read` | Yes | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all notifications as read |

---

## Reviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reviews` | Yes (Passenger) | Submit review for a completed booking |
| GET | `/api/reviews/driver/:driverId` | No | List reviews for a driver |
| GET | `/api/reviews/driver/:driverId/rating` | No | Get driver average rating |
| GET | `/api/reviews/check/:bookingId` | Yes | Check if booking has been reviewed |

---

## Service Areas

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/service-areas` | No | List all service areas |
| GET | `/api/service-areas/enabled` | No | List enabled service areas |
| GET | `/api/service-areas/:id` | No | Get service area by ID |
| POST | `/api/service-areas` | Yes (Admin) | Create a service area |
| PATCH | `/api/service-areas/:id` | Yes (Admin) | Update a service area |
| POST | `/api/service-areas/:id/validate` | Yes | Validate if a location is within area |

---

## Pricing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/pricing/estimate` | Yes | Get fare estimate for a route |
| GET | `/api/pricing/fare-config/:serviceAreaId` | No | Get fare configuration for area |
| GET | `/api/pricing/pickup-rules/:serviceAreaId` | No | Get pickup fee rules for area |
| POST | `/api/pricing/fare-config` | Yes (Admin) | Update fare configuration |
| POST | `/api/pricing/pickup-rules` | Yes (Admin) | Add pickup fee rule |
| DELETE | `/api/pricing/pickup-rules/:id` | Yes (Admin) | Remove pickup fee rule |

---

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/dashboard` | Yes (Admin) | Get platform dashboard stats |
| GET | `/api/admin/passengers` | Yes (Admin) | List all passengers (paginated) |
| GET | `/api/admin/drivers` | Yes (Admin) | List all drivers (paginated) |
| GET | `/api/admin/drivers/:id` | Yes (Admin) | Get driver detail by ID |
