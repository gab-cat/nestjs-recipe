import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { AUTH_SERVICE_CONFIG } from '@app/shared';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    AUTH_SERVICE_CONFIG,
  );

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();

  console.log(
    `🚀 Auth microservice is running on port ${AUTH_SERVICE_CONFIG.options?.port || 4001}`,
  );
}

void bootstrap();
