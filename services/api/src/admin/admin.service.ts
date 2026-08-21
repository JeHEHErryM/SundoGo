import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, DriverVerificationStatus, TripStatus } from '@prisma/client';

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
      onlineDrivers,
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
      this.prisma.trip.count({ where: { status: TripStatus.IN_PROGRESS } }),
      this.prisma.trip.count({ where: { status: TripStatus.COMPLETED } }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.driverAvailability.count({ where: { status: 'ONLINE' } }),
    ]);

    return {
      totalPassengers,
      totalDrivers,
      onlineDrivers,
      pendingVerifications,
      activeBookings,
      activeTrips,
      completedTrips,
      totalPlatformFees: Number(feeAggregation._sum.amount ?? 0),
    };
  }

  async listPassengers(
    page = 1,
    limit = 20,
    q?: string,
  ) {
    const skip = (page - 1) * limit;
    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' as const } },
            { lastName: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q } },
            { user: { email: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.passenger.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, role: true, createdAt: true } },
          _count: { select: { bookings: true, trips: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.passenger.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async listDrivers(
    page = 1,
    limit = 20,
    q?: string,
    verificationStatus?: DriverVerificationStatus,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      ...(verificationStatus ? { verification: { status: verificationStatus } } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' as const } },
              { lastName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q } },
              { user: { email: { contains: q, mode: 'insensitive' as const } } },
              { vehicle: { plateNumber: { contains: q, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
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
      this.prisma.driver.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async listBookings(page = 1, limit = 20, status?: BookingStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          passenger: { select: { id: true, firstName: true, lastName: true, phone: true } },
          driver: { select: { id: true, firstName: true, lastName: true, phone: true } },
          serviceArea: { select: { id: true, name: true } },
          payment: { select: { id: true, amount: true, method: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Reports summary over the last `days` days: trips per day, top drivers,
   * totals and demand per service area.
   */
  async getReports(days = 7) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const [tripsPerDayRaw, topDriversRaw, totalsAgg, completedCount, demandByAreaRaw] =
      await Promise.all([
        this.prisma.trip.findMany({
          where: { status: TripStatus.COMPLETED, completedAt: { gte: start } },
          select: { completedAt: true, booking: { select: { totalFare: true } } },
        }),
        this.prisma.driver.findMany({
          where: { trips: { some: { status: TripStatus.COMPLETED, completedAt: { gte: start } } } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            _count: { select: { trips: { where: { status: TripStatus.COMPLETED, completedAt: { gte: start } } } } },
            reviews: { select: { rating: true } },
          },
        }),
        this.prisma.payment.aggregate({
          where: { status: 'PAID', createdAt: { gte: start } },
          _sum: { amount: true },
        }),
        this.prisma.trip.count({
          where: { status: TripStatus.COMPLETED, completedAt: { gte: start } },
        }),
        this.prisma.serviceArea.findMany({
          select: {
            id: true,
            name: true,
            enabled: true,
            _count: {
              select: { bookings: { where: { createdAt: { gte: start } } } },
            },
          },
        }),
      ]);

    // Trips + revenue bucketed per day.
    const dayBuckets = new Map<string, { trips: number; revenue: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dayBuckets.set(d.toISOString().slice(0, 10), { trips: 0, revenue: 0 });
    }
    for (const trip of tripsPerDayRaw) {
      if (!trip.completedAt) continue;
      const key = trip.completedAt.toISOString().slice(0, 10);
      const bucket = dayBuckets.get(key);
      if (bucket) {
        bucket.trips += 1;
        bucket.revenue += Number(trip.booking?.totalFare ?? 0);
      }
    }

    const tripsPerDay = Array.from(dayBuckets.entries()).map(([date, v]) => ({
      date,
      ...v,
    }));

    const topDrivers = topDriversRaw
      .map((d) => ({
        id: d.id,
        name: [d.firstName, d.lastName].filter(Boolean).join(' '),
        trips: d._count.trips,
        rating: d.reviews.length
          ? Number((d.reviews.reduce((s, r) => s + r.rating, 0) / d.reviews.length).toFixed(1))
          : null,
      }))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 5);

    const demandByArea = demandByAreaRaw
      .map((a) => ({ id: a.id, name: a.name, enabled: a.enabled, bookings: a._count.bookings }))
      .sort((a, b) => b.bookings - a.bookings);

    return {
      days,
      totals: {
        trips: completedCount,
        revenue: Number(totalsAgg._sum.amount ?? 0),
      },
      tripsPerDay,
      topDrivers,
      demandByArea,
    };
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
