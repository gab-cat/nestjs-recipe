import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { AppConfigService, createTransportConfigs } from '@app/shared';
async function bootstrap(): Promise<void> {
  // Create a temporary app to get the config service
  const tempApp = await NestFactory.create(AuthModule);
  const configService = tempApp.get(AppConfigService);
  const { AUTH_SERVICE_CONFIG } = createTransportConfigs(configService);
  await tempApp.close();

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
