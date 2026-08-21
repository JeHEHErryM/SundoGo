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

  /**
   * Earnings summary for the driver app: today / this week / this month totals
   * plus a daily history series for the last `days` days.
   */
  async getDriverEarnings(driverId: string, startDate?: string, endDate?: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)); // Monday
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const historyStart = startDate ? new Date(startDate) : new Date(startOfToday);
    historyStart.setDate(historyStart.getDate() - 13); // default: last 14 days
    const historyEnd = endDate ? new Date(endDate) : now;

    const paidWhere = { status: PaymentStatus.PAID, trip: { driverId } };

    const [todayAgg, weekAgg, monthAgg, totalAgg, recentPayments] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...paidWhere, createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...paidWhere, createdAt: { gte: startOfWeek } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...paidWhere, createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: paidWhere,
        _sum: { amount: true },
      }),
      this.prisma.payment.findMany({
        where: {
          ...paidWhere,
          createdAt: { gte: historyStart, lte: historyEnd },
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Bucket payments per day (local time).
    const buckets = new Map<string, { amount: number; trips: number }>();
    for (const payment of recentPayments) {
      const key = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, '0')}-${String(payment.createdAt.getDate()).padStart(2, '0')}`;
      const bucket = buckets.get(key) ?? { amount: 0, trips: 0 };
      bucket.amount += Number(payment.amount);
      bucket.trips += 1;
      buckets.set(key, bucket);
    }

    const history: Array<{ date: string; amount: number; trips: number }> = [];
    const cursor = new Date(historyStart);
    while (cursor <= historyEnd) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      const bucket = buckets.get(key);
      if (bucket) history.push({ date: key, ...bucket });
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      today: Number(todayAgg._sum.amount ?? 0),
      thisWeek: Number(weekAgg._sum.amount ?? 0),
      thisMonth: Number(monthAgg._sum.amount ?? 0),
      totalEarnings: Number(totalAgg._sum.amount ?? 0),
      history,
    };
  }
}
