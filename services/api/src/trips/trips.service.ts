import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        booking: true,
        driver: true,
        passenger: true,
        locationHistory: { orderBy: { recordedAt: 'asc' } },
      },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async getDriverTrips(driverId: string, page = 1, limit = 20, status?: TripStatus) {
    const skip = (page - 1) * limit;
    const where = { driverId, ...(status ? { status } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: { booking: true, passenger: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPassengerTrips(passengerId: string, page = 1, limit = 20, status?: TripStatus) {
    const skip = (page - 1) * limit;
    const where = { passengerId, ...(status ? { status } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: { booking: true, driver: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getActiveTrip(driverId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        driverId,
        status: TripStatus.IN_PROGRESS,
      },
      include: { booking: true, passenger: true },
      orderBy: { createdAt: 'desc' },
    });
    return trip || null;
  }

  private lastLocationTime = new Map<string, number>();

  async addLocationHistory(tripId: string, lat: number, lng: number, speed?: number) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');

    const lastTime = this.lastLocationTime.get(tripId) ?? 0;
    const now = Date.now();
    if (now - lastTime < 10_000) {
      return { throttled: true };
    }
    this.lastLocationTime.set(tripId, now);

    const location = await this.prisma.locationHistory.create({
      data: {
        tripId,
        lat,
        lng,
        speed: speed ?? null,
      },
    });
    return location;
  }

  async getLocationHistory(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');

    return this.prisma.locationHistory.findMany({
      where: { tripId },
      orderBy: { recordedAt: 'asc' },
    });
  }

  async completeTrip(tripId: string, actualDistanceKm?: number) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.status !== TripStatus.IN_PROGRESS) {
      return trip;
    }

    return this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        completedAt: new Date(),
        actualDistanceKm: actualDistanceKm ?? null,
      },
    });
  }
}
