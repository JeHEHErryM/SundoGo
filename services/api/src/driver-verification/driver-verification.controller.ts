import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DriverVerificationService } from './driver-verification.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@sundogo/types';
import { DriversService } from '../drivers/drivers.service';

@Controller('api/driver-verification')
export class DriverVerificationController {
  constructor(
    private readonly verificationService: DriverVerificationService,
    private readonly driversService: DriversService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async getStatus(@CurrentUser() user: any) {
    const driver = await this.driversService.findByUserId(user.userId);
    const verification = await this.verificationService.findByDriverId(driver.id);
    return { success: true, data: verification };
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  async submit(
    @CurrentUser() user: any,
    @Body() dto: SubmitVerificationDto,
  ) {
    const driver = await this.driversService.findByUserId(user.userId);
    const verification = await this.verificationService.submit(driver.id, dto);
    return { success: true, data: verification };
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPending() {
    const verifications = await this.verificationService.getPending();
    return { success: true, data: verifications };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approve(@CurrentUser() user: any, @Param('id') id: string) {
    const verification = await this.verificationService.approve(id, user.userId);
    return { success: true, data: verification };
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async reject(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { notes: string },
  ) {
    const verification = await this.verificationService.reject(id, user.userId, body.notes);
    return { success: true, data: verification };
  }
}
