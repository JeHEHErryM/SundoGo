import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
