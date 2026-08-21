import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sundogo/types';
import { TripsService } from './trips.service';
import { AddLocationDto } from './dto/add-location.dto';

@Controller('api/trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  async getActive(@CurrentUser() user: any) {
    const data = await this.tripsService.getActiveTrip(user.driverId);
    return { success: true, data };
  }

  @Get()
  async listOwn(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);

    if (user.role === UserRole.DRIVER) {
      const data = await this.tripsService.getDriverTrips(user.driverId, p, l, status as any);
      return { success: true, data };
    }

    const data = await this.tripsService.getPassengerTrips(user.passengerId, p, l, status as any);
    return { success: true, data };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.tripsService.findById(id);
    return { success: true, data };
  }

  @Post(':id/location')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  async addLocation(
    @Param('id') id: string,
    @Body() dto: AddLocationDto,
  ) {
    const data = await this.tripsService.addLocationHistory(id, dto.lat, dto.lng, dto.speed);
    return { success: true, data };
  }

  @Get(':id/locations')
  async getLocations(@Param('id') id: string) {
    const data = await this.tripsService.getLocationHistory(id);
    return { success: true, data };
  }
}
