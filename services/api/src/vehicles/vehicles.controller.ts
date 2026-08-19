import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sundogo/types';
import { DriversService } from '../drivers/drivers.service';

@Controller('api/vehicles')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly driversService: DriversService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async getVehicle(@CurrentUser() user: any) {
    const driver = await this.driversService.findByUserId(user.userId);
    const vehicle = await this.vehiclesService.findByDriverId(driver.id);
    return { success: true, data: vehicle };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async createOrUpdateVehicle(
    @CurrentUser() user: any,
    @Body() dto: CreateVehicleDto,
  ) {
    const driver = await this.driversService.findByUserId(user.userId);
    const vehicle = await this.vehiclesService.create(driver.id, dto);
    return { success: true, data: vehicle };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async updateVehicle(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    const vehicle = await this.vehiclesService.update(id, dto);
    return { success: true, data: vehicle };
  }
}
