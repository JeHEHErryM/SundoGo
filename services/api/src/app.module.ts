import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PassengersModule } from './passengers/passengers.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriverVerificationModule } from './driver-verification/driver-verification.module';
import { AdminModule } from './admin/admin.module';
import { TripsModule } from './trips/trips.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { GatewayModule } from './gateway/gateway.module';
import { BookingsModule } from './bookings/bookings.module';
import { ServiceAreasModule } from './service-areas/service-areas.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PassengersModule,
    DriversModule,
    VehiclesModule,
    DriverVerificationModule,
    AdminModule,
    TripsModule,
    PaymentsModule,
    NotificationsModule,
    ReviewsModule,
    GatewayModule,
    BookingsModule,
    ServiceAreasModule,
    PricingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
