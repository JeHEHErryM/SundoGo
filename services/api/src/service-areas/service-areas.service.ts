import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';

@Injectable()
export class ServiceAreasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.serviceArea.findMany();
  }

  async findEnabled() {
    return this.prisma.serviceArea.findMany({ where: { enabled: true } });
  }

  async findById(id: string) {
    const area = await this.prisma.serviceArea.findUnique({
      where: { id },
      include: { fareConfigurations: true, pickupFeeRules: true },
    });
    if (!area) throw new NotFoundException('Service area not found');
    return area;
  }

  async create(dto: CreateServiceAreaDto) {
    return this.prisma.serviceArea.create({ data: dto });
  }

  async update(id: string, dto: UpdateServiceAreaDto) {
    await this.findById(id);
    return this.prisma.serviceArea.update({ where: { id }, data: dto });
  }

  async validateLocation(lat: number, lng: number, serviceAreaId: string): Promise<boolean> {
    const area = await this.prisma.serviceArea.findUnique({ where: { id: serviceAreaId } });
    if (!area) throw new NotFoundException('Service area not found');

    const polygon = area.geofence as { coordinates?: number[][][] };
    if (!polygon?.coordinates) return false;

    const rings = polygon.coordinates;
    const point: [number, number] = [lng, lat];

    let inside = false;
    for (const ring of rings) {
      if (this.isPointInPolygon(point, ring as [number, number][])) {
        inside = !inside;
      }
    }
    return inside;
  }

  calculatePickupDistance(pickupLat: number, pickupLng: number, driverLat: number, driverLng: number): number {
    return this.haversineDistance(pickupLat, pickupLng, driverLat, driverLng);
  }

  private isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
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
