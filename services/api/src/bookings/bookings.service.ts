import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceAreasService } from '../service-areas/service-areas.service';
import { PricingService } from '../pricing/pricing.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
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

    const serviceArea = await this.serviceAreasService.findById(booking.serviceAreaId);
    const maxRadius = Number(serviceArea.maxBookingRadiusKm);

    const eligibleDrivers = await this.prisma.driver.findMany({
      where: {
        verification: { status: 'APPROVED' },
        availability: { status: 'ONLINE' },
        bookings: { none: { status: { in: [BookingStatus.REQUESTED, BookingStatus.SEARCHING, BookingStatus.ACCEPTED, BookingStatus.DRIVER_ARRIVING, BookingStatus.DRIVER_ARRIVED, BookingStatus.IN_PROGRESS] } } },
      },
      include: { availability: true },
    });

    let nearestDriver: typeof eligibleDrivers[number] | null = null;
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
      await this.updateStatusInternal(bookingId, BookingStatus.CANCELLED);
      throw new BadRequestException('No drivers available');
    }

    const pickupFee = await this.pricingService.calculatePickupFee(nearestDistance, booking.serviceAreaId);
    const totalFare = await this.pricingService.calculateTotalFare(
      Number(booking.tripFare), pickupFee, booking.serviceAreaId,
    );

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId: nearestDriver.id,
        pickupDistanceKm: Math.round(nearestDistance * 100) / 100,
        pickupFee,
        totalFare: totalFare.total,
      },
    });

    await this.updateStatusInternal(bookingId, BookingStatus.ACCEPTED);

    return this.getBooking(bookingId);
  }

  async updateStatus(bookingId: string, newStatus: BookingStatus, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

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
        driver: true,
        serviceArea: true,
        trip: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async getPassengerBookings(passengerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { passengerId },
        include: { driver: true, serviceArea: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: { passengerId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDriverBookings(driverId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { driverId },
        include: { passenger: true, serviceArea: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: { driverId } }),
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

  private async updateStatusInternal(bookingId: string, newStatus: BookingStatus, userId?: string) {
    const data: Record<string, unknown> = { status: newStatus };

    if (newStatus === BookingStatus.CANCELLED) {
      data.cancelledAt = new Date();
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

    return booking;
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
