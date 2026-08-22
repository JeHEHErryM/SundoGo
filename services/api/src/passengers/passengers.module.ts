import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayModule } from '../gateway/gateway.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PassengersService } from './passengers.service';
import { PassengersController } from './passengers.controller';

@Module({
  imports: [PrismaModule, GatewayModule, NotificationsModule],
  controllers: [PassengersController],
  providers: [PassengersService],
  exports: [PassengersService],
})
export class PassengersModule {}
