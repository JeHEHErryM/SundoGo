import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDriverId(driverId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { driverId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async create(driverId: string, data: CreateVehicleDto) {
    const existing = await this.prisma.vehicle.findUnique({ where: { driverId } });
    if (existing) {
      return this.prisma.vehicle.update({
        where: { driverId },
        data,
      });
    }

    return this.prisma.vehicle.create({
      data: { driverId, ...data },
    });
  }

  async update(id: string, data: UpdateVehicleDto) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }
}
