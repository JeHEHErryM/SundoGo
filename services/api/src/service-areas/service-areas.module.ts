import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceAreasService } from './service-areas.service';
import { ServiceAreasController } from './service-areas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceAreasController],
  providers: [ServiceAreasService],
  exports: [ServiceAreasService],
})
export class ServiceAreasModule {}
