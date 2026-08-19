import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sundogo/types';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PASSENGER)
  async create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    const data = await this.reviewsService.create(
      dto.bookingId,
      user.passengerId,
      dto.rating,
      dto.comment,
    );
    return { success: true, data };
  }

  @Get('driver/:driverId')
  async getDriverReviews(
    @Param('driverId') driverId: string,
  ) {
    const data = await this.reviewsService.getDriverReviews(driverId);
    return { success: true, data };
  }

  @Get('driver/:driverId/rating')
  async getDriverRating(@Param('driverId') driverId: string) {
    const data = await this.reviewsService.getDriverAverageRating(driverId);
    return { success: true, data };
  }

  @Get('check/:bookingId')
  @UseGuards(JwtAuthGuard)
  async checkReviewed(@Param('bookingId') bookingId: string) {
    const data = await this.reviewsService.hasReviewed(bookingId);
    return { success: true, data };
  }
}
