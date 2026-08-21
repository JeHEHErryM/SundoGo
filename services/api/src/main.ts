import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Base64 profile photos can exceed Express's default 100kb JSON body limit.
  app.useBodyParser('json', { limit: '2mb' });

  app.enableCors({
    origin: [
      'https://sundo-go.vercel.app',
      'https://passenger-alpha.vercel.app',
      'https://driver-five-teal.vercel.app',
      'https://admin-lime-rho.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
