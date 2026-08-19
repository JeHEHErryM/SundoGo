import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sundogo/types';

@Controller('api/drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async getProfile(@CurrentUser() user: any) {
    const driver = await this.driversService.findByUserId(user.userId);
    return { success: true, data: driver };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateDriverDto) {
    const driver = await this.driversService.findByUserId(user.userId);
    const updated = await this.driversService.update(driver.id, dto);
    return { success: true, data: updated };
  }

  @Patch('location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async updateLocation(
    @CurrentUser() user: any,
    @Body() body: { lat: number; lng: number },
  ) {
    const driver = await this.driversService.findByUserId(user.userId);
    const updated = await this.driversService.updateLocation(driver.id, body.lat, body.lng);
    return { success: true, data: updated };
  }

  @Patch('availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async updateAvailability(
    @CurrentUser() user: any,
    @Body() body: { status: string },
  ) {
    const driver = await this.driversService.findByUserId(user.userId);
    const updated = await this.driversService.updateAvailability(
      driver.id,
      body.status as any,
    );
    return { success: true, data: updated };
  }

  @Get('available/:serviceAreaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAvailableDrivers(@Param('serviceAreaId') serviceAreaId: string) {
    const drivers = await this.driversService.getAvailableDrivers(serviceAreaId);
    return { success: true, data: drivers };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getById(@Param('id') id: string) {
    const driver = await this.driversService.findById(id);
    return { success: true, data: driver };
  }
}
