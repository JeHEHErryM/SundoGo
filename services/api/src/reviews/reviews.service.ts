import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(bookingId: string, passengerId: string, rating: number, comment?: string) {
    const existing = await this.prisma.review.findUnique({ where: { bookingId } });
    if (existing) throw new ConflictException('Review already exists for this booking');

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.driverId) throw new BadRequestException('Booking has no assigned driver');

    return this.prisma.review.create({
      data: {
        bookingId,
        passengerId,
        driverId: booking.driverId,
        rating,
        comment: comment ?? null,
      },
      include: { passenger: true, driver: true, booking: true },
    });
  }

  async getDriverReviews(driverId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { driverId },
        include: { passenger: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { driverId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDriverAverageRating(driverId: string) {
    const result = await this.prisma.review.aggregate({
      where: { driverId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      averageRating: result._avg.rating ?? 0,
      totalReviews: result._count,
    };
  }

  async hasReviewed(bookingId: string) {
    const review = await this.prisma.review.findUnique({ where: { bookingId } });
    return { reviewed: !!review };
  }
}
