import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverAvailabilityStatus } from '@prisma/client';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: {
        verification: true,
        vehicle: true,
        availability: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });
    if (!driver) throw new NotFoundException('Driver profile not found');
    return driver;
  }

  async findById(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        verification: true,
        vehicle: true,
        availability: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async create(userId: string, data: CreateDriverDto) {
    const existing = await this.prisma.driver.findUnique({ where: { userId } });
    if (existing) throw new HttpException('Driver profile already exists', HttpStatus.CONFLICT);

    return this.prisma.driver.create({
      data: { userId, ...data },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  async update(id: string, data: UpdateDriverDto) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundException('Driver not found');

    return this.prisma.driver.update({
      where: { id },
      data,
      include: {
        verification: true,
        vehicle: true,
        availability: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });
  }

  async updateLocation(id: string, lat: number, lng: number) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundException('Driver not found');

    return this.prisma.driver.update({
      where: { id },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async getAvailableDrivers(serviceAreaId: string) {
    return this.prisma.driver.findMany({
      where: {
        availability: { status: DriverAvailabilityStatus.ONLINE },
        verification: { status: 'APPROVED' },
        currentLat: { not: null },
        currentLng: { not: null },
      },
      include: {
        vehicle: true,
        availability: true,
        user: { select: { id: true, email: true } },
      },
    });
  }

  async updateAvailability(driverId: string, status: DriverAvailabilityStatus) {
    const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver not found');

    return this.prisma.driverAvailability.upsert({
      where: { driverId },
      update: { status, lastLocationUpdate: new Date() },
      create: { driverId, status, lastLocationUpdate: new Date() },
    });
  }
}
