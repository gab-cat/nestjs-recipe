import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { UsersModule } from './users.module';
import { USERS_SERVICE_CONFIG } from '@app/shared';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    USERS_SERVICE_CONFIG,
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
    `🚀 Users microservice is running on port ${USERS_SERVICE_CONFIG.options?.port || 4003}`,
  );
}

void bootstrap();
