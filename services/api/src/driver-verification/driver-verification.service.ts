import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { DriverVerificationStatus } from '@prisma/client';

@Injectable()
export class DriverVerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDriverId(driverId: string) {
    const verification = await this.prisma.driverVerification.findUnique({
      where: { driverId },
    });
    if (!verification) throw new NotFoundException('Verification not found');
    return verification;
  }

  async submit(driverId: string, dto: SubmitVerificationDto) {
    const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver not found');

    const existing = await this.prisma.driverVerification.findUnique({ where: { driverId } });
    if (existing && existing.status === DriverVerificationStatus.APPROVED) {
      throw new HttpException('Already approved', HttpStatus.CONFLICT);
    }

    if (existing) {
      return this.prisma.driverVerification.update({
        where: { driverId },
        data: {
          ...dto,
          status: DriverVerificationStatus.PENDING,
          notes: null,
          reviewedBy: null,
          reviewedAt: null,
        },
      });
    }

    return this.prisma.driverVerification.create({
      data: { driverId, ...dto },
    });
  }

  async approve(id: string, reviewedBy: string) {
    const verification = await this.prisma.driverVerification.findUnique({ where: { id } });
    if (!verification) throw new NotFoundException('Verification not found');
    if (verification.status === DriverVerificationStatus.APPROVED) {
      throw new HttpException('Already approved', HttpStatus.CONFLICT);
    }

    return this.prisma.driverVerification.update({
      where: { id },
      data: {
        status: DriverVerificationStatus.APPROVED,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  async reject(id: string, reviewedBy: string, notes: string) {
    const verification = await this.prisma.driverVerification.findUnique({ where: { id } });
    if (!verification) throw new NotFoundException('Verification not found');

    return this.prisma.driverVerification.update({
      where: { id },
      data: {
        status: DriverVerificationStatus.REJECTED,
        reviewedBy,
        reviewedAt: new Date(),
        notes,
      },
    });
  }

  async getPending() {
    return this.prisma.driverVerification.findMany({
      where: { status: DriverVerificationStatus.PENDING },
      include: {
        driver: {
          include: {
            user: { select: { id: true, email: true } },
            vehicle: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
