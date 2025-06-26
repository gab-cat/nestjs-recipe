import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { UsersModule } from './users.module';
import { AppConfigService, createTransportConfigs } from '@app/shared';
async function bootstrap(): Promise<void> {
  // Create a temporary app to get the config service
  const tempApp = await NestFactory.create(UsersModule);
  const configService = tempApp.get(AppConfigService);
  const { USERS_SERVICE_CONFIG } = createTransportConfigs(configService);
  await tempApp.close();

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
