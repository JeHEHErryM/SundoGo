import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PassengersService } from './passengers.service';
import { PassengersController } from './passengers.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PassengersController],
  providers: [PassengersService],
  exports: [PassengersService],
})
export class PassengersModule {}
