import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFareConfigDto } from './dto/update-fare-config.dto';
import { AddPickupFeeRuleDto } from './dto/add-pickup-fee-rule.dto';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getFareConfiguration(serviceAreaId: string) {
    const config = await this.prisma.fareConfiguration.findFirst({
      where: { serviceAreaId, active: true },
    });
    if (!config) throw new NotFoundException('Fare configuration not found');
    return config;
  }

  async getPickupFeeRules(serviceAreaId: string) {
    return this.prisma.pickupFeeRule.findMany({
      where: { serviceAreaId },
      orderBy: { minDistanceKm: 'asc' },
    });
  }

  async calculateTripFare(distanceKm: number, serviceAreaId: string) {
    const config = await this.getFareConfiguration(serviceAreaId);
    const tripFare = Number(config.baseFare) + distanceKm * Number(config.perKmRate);
    return {
      tripFare: Math.round(tripFare * 100) / 100,
      baseFare: Number(config.baseFare),
      perKmRate: Number(config.perKmRate),
      distanceKm,
    };
  }

  async calculatePickupFee(pickupDistanceKm: number, serviceAreaId: string): Promise<number> {
    if (pickupDistanceKm === 0) return 0;

    const rules = await this.getPickupFeeRules(serviceAreaId);
    if (rules.length === 0) return 0;

    for (const rule of rules) {
      if (pickupDistanceKm >= Number(rule.minDistanceKm) && pickupDistanceKm <= Number(rule.maxDistanceKm)) {
        return Number(rule.fee);
      }
    }

    const maxRule = rules[rules.length - 1];
    if (pickupDistanceKm > Number(maxRule.maxDistanceKm)) {
      return Number(maxRule.fee);
    }

    return 0;
  }

  async calculateTotalFare(tripFare: number, pickupFee: number, serviceAreaId: string) {
    const config = await this.getFareConfiguration(serviceAreaId);
    const platformFee = Number(config.platformFee);
    return {
      tripFare,
      pickupFee,
      platformFee,
      total: Math.round((tripFare + pickupFee + platformFee) * 100) / 100,
    };
  }

  async getFareEstimate(
    pickupLat: number,
    pickupLng: number,
    destLat: number,
    destLng: number,
    serviceAreaId: string,
  ) {
    const tripDistanceKm = this.haversineDistance(pickupLat, pickupLng, destLat, destLng);
    const { tripFare, baseFare, perKmRate } = await this.calculateTripFare(tripDistanceKm, serviceAreaId);
    const fareBreakdown = await this.calculateTotalFare(tripFare, 0, serviceAreaId);

    return {
      tripDistanceKm: Math.round(tripDistanceKm * 100) / 100,
      baseFare,
      perKmRate,
      tripFare: fareBreakdown.tripFare,
      pickupFee: 0,
      platformFee: fareBreakdown.platformFee,
      total: fareBreakdown.total,
    };
  }

  async updateFareConfiguration(serviceAreaId: string, dto: UpdateFareConfigDto) {
    const existing = await this.prisma.fareConfiguration.findFirst({
      where: { serviceAreaId, active: true },
    });

    if (existing) {
      return this.prisma.fareConfiguration.update({
        where: { id: existing.id },
        data: {
          baseFare: dto.baseFare,
          perKmRate: dto.perKmRate,
          platformFee: dto.platformFee,
        },
      });
    }

    return this.prisma.fareConfiguration.create({
      data: { serviceAreaId, ...dto },
    });
  }

  async addPickupFeeRule(serviceAreaId: string, dto: AddPickupFeeRuleDto) {
    return this.prisma.pickupFeeRule.create({
      data: { serviceAreaId, ...dto },
    });
  }

  async removePickupFeeRule(id: string) {
    return this.prisma.pickupFeeRule.delete({ where: { id } });
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
