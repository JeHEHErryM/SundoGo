import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DriverVerificationService } from './driver-verification.service';
import { DriverVerificationController } from './driver-verification.controller';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [PrismaModule, DriversModule],
  controllers: [DriverVerificationController],
  providers: [DriverVerificationService],
  exports: [DriverVerificationService],
})
export class DriverVerificationModule {}
