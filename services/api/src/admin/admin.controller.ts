import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@sundogo/types';
import { BookingStatus, DriverVerificationStatus } from '@prisma/client';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    const stats = await this.adminService.getDashboard();
    return { success: true, data: stats };
  }

  @Get('reports')
  async getReports(@Query('days') days?: string) {
    const parsed = days ? parseInt(days, 10) : 7;
    const reports = await this.adminService.getReports(
      Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 90) : 7,
    );
    return { success: true, data: reports };
  }

  @Get('bookings')
  async listBookings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.adminService.listBookings(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status && Object.values(BookingStatus).includes(status as BookingStatus)
        ? (status as BookingStatus)
        : undefined,
    );
    return { success: true, data: result };
  }

  @Get('passengers')
  async listPassengers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const result = await this.adminService.listPassengers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      q || undefined,
    );
    return { success: true, data: result };
  }

  @Get('drivers')
  async listDrivers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('verification') verification?: string,
  ) {
    const result = await this.adminService.listDrivers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      q || undefined,
      verification &&
        Object.values(DriverVerificationStatus).includes(verification as DriverVerificationStatus)
        ? (verification as DriverVerificationStatus)
        : undefined,
    );
    return { success: true, data: result };
  }

  @Get('drivers/:id')
  async getDriver(@Param('id') id: string) {
    const driver = await this.adminService.getDriver(id);
    return { success: true, data: driver };
  }
}
