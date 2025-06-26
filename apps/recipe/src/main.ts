import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RecipeModule } from './recipe.module';
import { AppConfigService, createTransportConfigs } from '@app/shared';
async function bootstrap(): Promise<void> {
  // Create a temporary app to get the config service
  const tempApp = await NestFactory.create(RecipeModule);
  const configService = tempApp.get(AppConfigService);
  const { RECIPE_SERVICE_CONFIG } = createTransportConfigs(configService);
  await tempApp.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RecipeModule,
    RECIPE_SERVICE_CONFIG,
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
    `🚀 Recipe microservice is running on port ${RECIPE_SERVICE_CONFIG.options?.port || 4002}`,
  );
}

void bootstrap();
