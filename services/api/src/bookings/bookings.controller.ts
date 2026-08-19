import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sundogo/types';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('api/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PASSENGER)
  async create(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    const data = await this.bookingsService.createBooking(user.passengerId, dto);
    return { success: true, data };
  }

  @Get()
  async listOwn(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);

    if (user.role === UserRole.DRIVER) {
      const data = await this.bookingsService.getDriverBookings(user.driverId, p, l);
      return { success: true, data };
    }

    const data = await this.bookingsService.getPassengerBookings(user.passengerId, p, l);
    return { success: true, data };
  }

  @Get('active')
  async getActive(@CurrentUser() user: any) {
    const data = await this.bookingsService.getActiveBookingForDriver(user.driverId);
    return { success: true, data };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.bookingsService.getBooking(id);
    return { success: true, data };
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason?: string) {
    const userId = user.id;
    const data = await this.bookingsService.cancelBooking(id, userId, reason);
    return { success: true, data };
  }

  @Post(':id/confirm-driver')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PASSENGER)
  async confirmDriver(@Param('id') id: string) {
    const data = await this.bookingsService.searchDriver(id);
    return { success: true, data };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: any) {
    const data = await this.bookingsService.updateStatus(id, dto.status, user.id);
    return { success: true, data };
  }
}
