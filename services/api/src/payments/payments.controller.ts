import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sundogo/types';
import { PaymentsService } from './payments.service';
import { RecordPaymentDto } from './dto/record-payment.dto';

@Controller('api/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('booking/:bookingId')
  async getByBooking(@Param('bookingId') bookingId: string) {
    const data = await this.paymentsService.findByBookingId(bookingId);
    return { success: true, data };
  }

  @Post(':bookingId/record')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  async recordPayment(
    @Param('bookingId') bookingId: string,
    @Body() dto: RecordPaymentDto,
  ) {
    const data = await this.paymentsService.recordPayment(bookingId, dto.method);
    return { success: true, data };
  }

  @Get('earnings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  async getEarnings(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.paymentsService.getDriverEarnings(user.driverId, startDate, endDate);
    return { success: true, data };
  }
}
