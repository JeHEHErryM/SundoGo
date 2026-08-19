import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@sundogo/types';
import { PricingService } from './pricing.service';
import { UpdateFareConfigDto } from './dto/update-fare-config.dto';
import { AddPickupFeeRuleDto } from './dto/add-pickup-fee-rule.dto';

@Controller('api/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('estimate')
  @UseGuards(JwtAuthGuard)
  async getEstimate(
    @Query('pickupLat') pickupLat: string,
    @Query('pickupLng') pickupLng: string,
    @Query('destLat') destLat: string,
    @Query('destLng') destLng: string,
    @Query('serviceAreaId') serviceAreaId: string,
  ) {
    const data = await this.pricingService.getFareEstimate(
      parseFloat(pickupLat),
      parseFloat(pickupLng),
      parseFloat(destLat),
      parseFloat(destLng),
      serviceAreaId,
    );
    return { success: true, data };
  }

  @Get('fare-config/:serviceAreaId')
  async getFareConfig(@Param('serviceAreaId') serviceAreaId: string) {
    const data = await this.pricingService.getFareConfiguration(serviceAreaId);
    return { success: true, data };
  }

  @Get('pickup-rules/:serviceAreaId')
  async getPickupRules(@Param('serviceAreaId') serviceAreaId: string) {
    const data = await this.pricingService.getPickupFeeRules(serviceAreaId);
    return { success: true, data };
  }

  @Post('fare-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateFareConfig(
    @Query('serviceAreaId') serviceAreaId: string,
    @Body() dto: UpdateFareConfigDto,
  ) {
    const data = await this.pricingService.updateFareConfiguration(serviceAreaId, dto);
    return { success: true, data };
  }

  @Post('pickup-rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addPickupFeeRule(
    @Query('serviceAreaId') serviceAreaId: string,
    @Body() dto: AddPickupFeeRuleDto,
  ) {
    const data = await this.pricingService.addPickupFeeRule(serviceAreaId, dto);
    return { success: true, data };
  }

  @Delete('pickup-rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removePickupFeeRule(@Param('id') id: string) {
    const data = await this.pricingService.removePickupFeeRule(id);
    return { success: true, data };
  }
}
