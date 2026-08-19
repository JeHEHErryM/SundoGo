import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true, trip: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findByBookingId(bookingId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
      include: { booking: true, trip: true },
    });
    if (!payment) throw new NotFoundException('Payment not found for this booking');
    return payment;
  }

  async recordPayment(bookingId: string, method: PaymentMethod) {
    const existing = await this.prisma.payment.findUnique({ where: { bookingId } });
    if (!existing) throw new NotFoundException('Payment record not found');

    return this.prisma.payment.update({
      where: { bookingId },
      data: {
        method,
        status: PaymentStatus.PAID,
      },
    });
  }

  async getDriverEarnings(driverId: string, startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = {
      trip: { driverId },
      status: PaymentStatus.PAID,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const result = await this.prisma.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    return {
      totalEarnings: result._sum.amount ?? 0,
      tripCount: result._count,
    };
  }
}
