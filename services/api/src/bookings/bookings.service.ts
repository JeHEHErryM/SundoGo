import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceAreasService } from '../service-areas/service-areas.service';
import { PricingService } from '../pricing/pricing.service';
import { BookingsGateway } from '../gateway/bookings.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { BOOKING_EVENTS } from '../gateway/events';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, Prisma } from '@prisma/client';

type PrismaBookingWithRelations = Prisma.BookingGetPayload<{
  include: { passenger: true; driver: true; serviceArea: true };
}>;

type DriverLocationFields = Pick<
  Prisma.DriverGetPayload<{ select: { currentLat: true; currentLng: true } }>,
  'currentLat' | 'currentLng'
>;

interface OfferCandidate extends DriverLocationFields {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  /** bookingId -> driver ids that declined the offer (in-memory, MVP scope) */
  private readonly declinedDrivers = new Map<string, Set<string>>();

  private readonly validTransitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.REQUESTED]: [BookingStatus.SEARCHING, BookingStatus.CANCELLED],
    [BookingStatus.SEARCHING]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
    [BookingStatus.ACCEPTED]: [BookingStatus.DRIVER_ARRIVING, BookingStatus.CANCELLED],
    [BookingStatus.DRIVER_ARRIVING]: [BookingStatus.DRIVER_ARRIVED],
    [BookingStatus.DRIVER_ARRIVED]: [BookingStatus.IN_PROGRESS],
    [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.CANCELLED]: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly serviceAreasService: ServiceAreasService,
    private readonly pricingService: PricingService,
    private readonly gateway: BookingsGateway,
    private readonly notifications: NotificationsService,
  ) {}

  async createBooking(passengerId: string, dto: CreateBookingDto) {
    const pickupValid = await this.serviceAreasService.validateLocation(
      dto.pickupLat, dto.pickupLng, dto.serviceAreaId,
    );
    if (!pickupValid) throw new BadRequestException('Pickup location is outside the service area');

    const destValid = await this.serviceAreasService.validateLocation(
      dto.destinationLat, dto.destinationLng, dto.serviceAreaId,
    );
    if (!destValid) throw new BadRequestException('Destination is outside the service area');

    const tripDistanceKm = this.haversineDistance(
      dto.pickupLat, dto.pickupLng, dto.destinationLat, dto.destinationLng,
    );
    const roundedDistance = Math.round(tripDistanceKm * 100) / 100;

    const fareResult = await this.pricingService.calculateTripFare(roundedDistance, dto.serviceAreaId);
    const totalFare = await this.pricingService.calculateTotalFare(fareResult.tripFare, 0, dto.serviceAreaId);

    const booking = await this.prisma.booking.create({
      data: {
        passengerId,
        serviceAreaId: dto.serviceAreaId,
        status: BookingStatus.REQUESTED,
        pickupLat: dto.pickupLat,
        pickupLng: dto.pickupLng,
        pickupAddress: dto.pickupAddress,
        destinationLat: dto.destinationLat,
        destinationLng: dto.destinationLng,
        destinationAddress: dto.destinationAddress,
        tripDistanceKm: roundedDistance,
        tripFare: totalFare.tripFare,
        pickupFee: 0,
        platformFee: totalFare.platformFee,
        totalFare: totalFare.total,
        statusHistory: {
          create: { status: BookingStatus.REQUESTED },
        },
      },
      include: { statusHistory: true },
    });

    return booking;
  }

  async searchDriver(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.REQUESTED) {
      throw new BadRequestException('Booking is not in REQUESTED status');
    }

    await this.updateStatusInternal(bookingId, BookingStatus.SEARCHING);
    this.declinedDrivers.set(bookingId, new Set());

    return this.offerToNextDriver(bookingId);
  }

  /**
   * Offer flow: assigns the nearest eligible driver provisionally (booking stays
   * SEARCHING) and pushes a booking:offer event. The driver accepts via
   * PATCH :id/status ACCEPTED or declines via :id/reject-offer.
   */
  private async offerToNextDriver(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.status !== BookingStatus.SEARCHING) {
      throw new BadRequestException('Booking is no longer searching');
    }

    const serviceArea = await this.serviceAreasService.findById(booking.serviceAreaId);
    const maxRadius = Number(serviceArea.maxBookingRadiusKm);
    const declined = this.declinedDrivers.get(bookingId) ?? new Set<string>();

    const eligibleDrivers: OfferCandidate[] = await this.prisma.driver.findMany({
      where: {
        verification: { status: 'APPROVED' },
        availability: { status: 'ONLINE' },
        id: { notIn: Array.from(declined) },
        bookings: { none: { status: { in: [BookingStatus.REQUESTED, BookingStatus.SEARCHING, BookingStatus.ACCEPTED, BookingStatus.DRIVER_ARRIVING, BookingStatus.DRIVER_ARRIVED, BookingStatus.IN_PROGRESS] } } },
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        phone: true,
        currentLat: true,
        currentLng: true,
      },
    });

    let nearestDriver: OfferCandidate | null = null;
    let nearestDistance = Infinity;

    for (const driver of eligibleDrivers) {
      if (!driver.currentLat || !driver.currentLng) continue;
      const dist = this.haversineDistance(
        Number(booking.pickupLat), Number(booking.pickupLng),
        Number(driver.currentLat), Number(driver.currentLng),
      );
      if (dist <= maxRadius && dist < nearestDistance) {
        nearestDistance = dist;
        nearestDriver = driver;
      }
    }

    if (!nearestDriver) {
      this.declinedDrivers.delete(bookingId);
      await this.updateStatusInternal(bookingId, BookingStatus.CANCELLED, undefined, 'No drivers available');
      throw new BadRequestException('No drivers available');
    }

    const pickupFee = await this.pricingService.calculatePickupFee(nearestDistance, booking.serviceAreaId);
    const totalFare = await this.pricingService.calculateTotalFare(
      Number(booking.tripFare), pickupFee, booking.serviceAreaId,
    );

    // Provisional assignment — booking remains SEARCHING until driver accepts.
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId: nearestDriver.id,
        pickupDistanceKm: Math.round(nearestDistance * 100) / 100,
        pickupFee,
        totalFare: totalFare.total,
      },
      include: { passenger: true, driver: true, serviceArea: true },
    });

    this.gateway.notifyDriver(nearestDriver.userId, BOOKING_EVENTS.BOOKING_OFFER, {
      bookingId: updated.id,
      status: updated.status,
      pickupAddress: updated.pickupAddress,
      destinationAddress: updated.destinationAddress,
      pickupDistanceKm: updated.pickupDistanceKm,
      tripDistanceKm: updated.tripDistanceKm,
      tripFare: updated.tripFare,
      pickupFee: updated.pickupFee,
      platformFee: updated.platformFee,
      totalFare: updated.totalFare,
      passengerFirstName: updated.passenger?.firstName,
      passengerLastName: updated.passenger?.lastName,
      passengerPhone: updated.passenger?.phone,
    });

    return updated;
  }

  /** Driver declines a provisional offer; reassign to the next nearest driver. */
  async rejectOffer(bookingId: string, driverUserId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { driver: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.SEARCHING) {
      throw new BadRequestException('Booking is no longer awaiting acceptance');
    }
    if (!booking.driver || booking.driver.userId !== driverUserId) {
      throw new ForbiddenException('This offer is not assigned to you');
    }

    const declined = this.declinedDrivers.get(bookingId) ?? new Set<string>();
    declined.add(booking.driver.id);
    this.declinedDrivers.set(bookingId, declined);

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { driverId: null, pickupFee: 0, pickupDistanceKm: null },
    });

    try {
      return await this.offerToNextDriver(bookingId);
    } catch {
      // No drivers left — offerToNextDriver already cancelled the booking.
      return this.getBooking(bookingId);
    }
  }

  /** Current pending offer for a driver (polling fallback for socket push). */
  async getPendingOfferForDriver(driverId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { driverId, status: BookingStatus.SEARCHING },
      include: { passenger: true, serviceArea: true },
      orderBy: { createdAt: 'desc' },
    });
    return booking || null;
  }

  async updateStatus(bookingId: string, newStatus: BookingStatus, userId: string, driverId?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (newStatus === BookingStatus.ACCEPTED) {
      if (!driverId || !booking.driverId || booking.driverId !== driverId) {
        throw new ForbiddenException('This booking is not offered to you');
      }
      this.declinedDrivers.delete(bookingId);
    }

    if (!this.isValidTransition(booking.status, newStatus)) {
      throw new BadRequestException(`Invalid transition from ${booking.status} to ${newStatus}`);
    }

    return this.updateStatusInternal(bookingId, newStatus, userId);
  }

  async getBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        passenger: true,
        driver: { include: { vehicle: true } },
        serviceArea: true,
        trip: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async getPassengerBookings(passengerId: string, page = 1, limit = 20, status?: BookingStatus) {
    const skip = (page - 1) * limit;
    const where = { passengerId, ...(status ? { status } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: { driver: true, serviceArea: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDriverBookings(driverId: string, page = 1, limit = 20, status?: BookingStatus) {
    const skip = (page - 1) * limit;
    const where = { driverId, ...(status ? { status } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: { passenger: true, serviceArea: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getActiveBookingForDriver(driverId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        driverId,
        status: { in: [BookingStatus.ACCEPTED, BookingStatus.DRIVER_ARRIVING, BookingStatus.DRIVER_ARRIVED, BookingStatus.IN_PROGRESS] },
      },
      include: { passenger: true, serviceArea: true },
      orderBy: { createdAt: 'desc' },
    });
    return booking || null;
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (!this.isValidTransition(booking.status, BookingStatus.CANCELLED)) {
      throw new BadRequestException('Booking cannot be cancelled in current status');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
        statusHistory: {
          create: { status: BookingStatus.CANCELLED, changedBy: userId },
        },
      },
      include: { statusHistory: true },
    });
  }

  private async updateStatusInternal(
    bookingId: string,
    newStatus: BookingStatus,
    userId?: string,
    cancelReason?: string,
  ) {
    const data: Record<string, unknown> = { status: newStatus };

    if (newStatus === BookingStatus.CANCELLED) {
      data.cancelledAt = new Date();
      if (cancelReason) data.cancelReason = cancelReason;
    }

    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...data,
        statusHistory: {
          create: { status: newStatus, changedBy: userId ?? null },
        },
      },
      include: { passenger: true, driver: true, serviceArea: true },
    });

    if (newStatus === BookingStatus.COMPLETED) {
      await this.prisma.trip.create({
        data: {
          bookingId: booking.id,
          driverId: booking.driverId!,
          passengerId: booking.passengerId,
          status: 'IN_PROGRESS',
        },
      });

      const trip = await this.prisma.trip.findUnique({ where: { bookingId: booking.id } });
      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          tripId: trip!.id,
          amount: booking.totalFare,
          method: 'CASH',
          status: 'PENDING',
        },
      });
    }

    this.emitLifecycleEvent(booking, newStatus, cancelReason);
    return booking;
  }

  /** Pushes socket events + in-app notifications for booking lifecycle transitions. */
  private emitLifecycleEvent(
    booking: PrismaBookingWithRelations,
    newStatus: BookingStatus,
    cancelReason?: string,
  ): void {
    const payload = { bookingId: booking.id };
    const passengerUserId = booking.passenger?.userId;

    try {
      switch (newStatus) {
        case BookingStatus.ACCEPTED:
          this.gateway.emitToBookingRoom(booking.id, BOOKING_EVENTS.BOOKING_ACCEPTED, {
            ...payload,
            driverInfo: booking.driver
              ? {
                  firstName: booking.driver.firstName,
                  lastName: booking.driver.lastName,
                  phone: booking.driver.phone,
                }
              : null,
          });
          if (passengerUserId) {
            void this.notifications.create(
              passengerUserId,
              'BOOKING_ACCEPTED',
              'Driver found',
              `${booking.driver?.firstName ?? 'Your driver'} accepted your booking.`,
              payload,
            );
          }
          break;
        case BookingStatus.DRIVER_ARRIVING:
          this.gateway.emitToBookingRoom(booking.id, BOOKING_EVENTS.DRIVER_ARRIVING, payload);
          if (passengerUserId) {
            void this.notifications.create(
              passengerUserId,
              'DRIVER_ARRIVING',
              'Driver on the way',
              `${booking.driver?.firstName ?? 'Your driver'} is heading to your pickup point.`,
              payload,
            );
          }
          break;
        case BookingStatus.DRIVER_ARRIVED:
          this.gateway.emitToBookingRoom(booking.id, BOOKING_EVENTS.DRIVER_ARRIVED, payload);
          if (passengerUserId) {
            void this.notifications.create(
              passengerUserId,
              'DRIVER_ARRIVED',
              'Driver arrived',
              `${booking.driver?.firstName ?? 'Your driver'} is waiting at the pickup point.`,
              payload,
            );
          }
          break;
        case BookingStatus.IN_PROGRESS:
          this.gateway.emitToBookingRoom(booking.id, BOOKING_EVENTS.TRIP_STARTED, payload);
          if (passengerUserId) {
            void this.notifications.create(
              passengerUserId,
              'TRIP_STARTED',
              'Trip started',
              'Enjoy your ride to your destination.',
              payload,
            );
          }
          break;
        case BookingStatus.COMPLETED:
          this.gateway.emitToBookingRoom(booking.id, BOOKING_EVENTS.TRIP_COMPLETED, payload);
          if (passengerUserId) {
            void this.notifications.create(
              passengerUserId,
              'TRIP_COMPLETED',
              'Trip completed',
              `Total fare: ₱${Number(booking.totalFare).toFixed(2)}. Cash payment due.`,
              payload,
            );
          }
          break;
        case BookingStatus.CANCELLED:
          this.gateway.emitToBookingRoom(booking.id, BOOKING_EVENTS.BOOKING_CANCELLED, {
            ...payload,
            reason: cancelReason,
          });
          if (passengerUserId) {
            void this.notifications.create(
              passengerUserId,
              'BOOKING_CANCELLED',
              'Booking cancelled',
              cancelReason ?? 'Your booking was cancelled.',
              payload,
            );
          }
          break;
        default:
          break;
      }
    } catch (err) {
      this.logger.warn(`Failed to emit lifecycle event for booking ${booking.id}: ${String(err)}`);
    }
  }

  private isValidTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
    return this.validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
