import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@sundogo/types';
import { ServiceAreasService } from './service-areas.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { ValidateLocationDto } from './dto/validate-location.dto';

@Controller('api/service-areas')
export class ServiceAreasController {
  constructor(private readonly serviceAreasService: ServiceAreasService) {}

  @Get()
  async findAll() {
    const data = await this.serviceAreasService.findAll();
    return { success: true, data };
  }

  @Get('enabled')
  async findEnabled() {
    const data = await this.serviceAreasService.findEnabled();
    return { success: true, data };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.serviceAreasService.findById(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateServiceAreaDto) {
    const data = await this.serviceAreasService.create(dto);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateServiceAreaDto) {
    const data = await this.serviceAreasService.update(id, dto);
    return { success: true, data };
  }

  @Post(':id/validate')
  @UseGuards(JwtAuthGuard)
  async validateLocation(@Param('id') id: string, @Body() dto: ValidateLocationDto) {
    const data = await this.serviceAreasService.validateLocation(dto.lat, dto.lng, id);
    return { success: true, data };
  }
}
