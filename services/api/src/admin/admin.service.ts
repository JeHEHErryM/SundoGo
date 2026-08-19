import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, TripStatus, DriverVerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalPassengers,
      totalDrivers,
      pendingVerifications,
      activeBookings,
      activeTrips,
      completedTrips,
      feeAggregation,
    ] = await Promise.all([
      this.prisma.passenger.count(),
      this.prisma.driver.count(),
      this.prisma.driverVerification.count({
        where: { status: DriverVerificationStatus.PENDING },
      }),
      this.prisma.booking.count({
        where: {
          status: {
            in: [
              BookingStatus.REQUESTED,
              BookingStatus.SEARCHING,
              BookingStatus.ACCEPTED,
              BookingStatus.DRIVER_ARRIVING,
              BookingStatus.DRIVER_ARRIVED,
              BookingStatus.IN_PROGRESS,
            ],
          },
        },
      }),
      this.prisma.trip.count({
        where: { status: TripStatus.IN_PROGRESS },
      }),
      this.prisma.trip.count({
        where: { status: TripStatus.COMPLETED },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPassengers,
      totalDrivers,
      pendingVerifications,
      activeBookings,
      activeTrips,
      completedTrips,
      totalPlatformFees: Number(feeAggregation._sum.amount ?? 0),
    };
  }

  async listPassengers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.passenger.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, role: true, createdAt: true } },
          _count: { select: { bookings: true, trips: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.passenger.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async listDrivers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, role: true, createdAt: true } },
          verification: true,
          vehicle: true,
          availability: true,
          _count: { select: { bookings: true, trips: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDriver(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, createdAt: true } },
        verification: true,
        vehicle: true,
        availability: true,
        bookings: { orderBy: { createdAt: 'desc' }, take: 10 },
        trips: { orderBy: { createdAt: 'desc' }, take: 10 },
        reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }
}
