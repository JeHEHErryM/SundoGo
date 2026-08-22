import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PassengersService } from './passengers.service';
import { UpdatePassengerDto } from './dto/update-passenger.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { TriggerEmergencyAlertDto } from './dto/trigger-emergency-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sundogo/types';

@Controller('api/passengers')
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    const passenger = await this.passengersService.findByUserId(user.userId);
    return { success: true, data: passenger };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdatePassengerDto) {
    const passenger = await this.passengersService.findByUserId(user.userId);
    const updated = await this.passengersService.update(passenger.id, dto);
    return { success: true, data: updated };
  }

  @Get('emergency-contacts')
  @UseGuards(JwtAuthGuard)
  async getEmergencyContacts(@CurrentUser() user: any) {
    const passenger = await this.passengersService.findByUserId(user.userId);
    const contacts = await this.passengersService.getEmergencyContacts(passenger.id);
    return { success: true, data: contacts };
  }

  @Post('emergency-contacts')
  @UseGuards(JwtAuthGuard)
  async addEmergencyContact(
    @CurrentUser() user: any,
    @Body() dto: CreateEmergencyContactDto,
  ) {
    const passenger = await this.passengersService.findByUserId(user.userId);
    const contact = await this.passengersService.addEmergencyContact(passenger.id, dto);
    return { success: true, data: contact };
  }

  @Delete('emergency-contacts/:id')
  @UseGuards(JwtAuthGuard)
  async removeEmergencyContact(@CurrentUser() user: any, @Param('id') id: string) {
    await this.passengersService.removeEmergencyContact(id);
    return { success: true };
  }

  @Post('emergency-alert')
  @UseGuards(JwtAuthGuard)
  async triggerEmergencyAlert(
    @CurrentUser() user: any,
    @Body() dto: TriggerEmergencyAlertDto,
  ) {
    const passenger = await this.passengersService.findByUserId(user.userId);
    const result = await this.passengersService.triggerEmergencyAlert(
      passenger.id,
      dto?.message,
    );
    return { success: true, data: result };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getById(@Param('id') id: string) {
    const passenger = await this.passengersService.findById(id);
    return { success: true, data: passenger };
  }
}
