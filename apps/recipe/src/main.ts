import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RecipeModule } from './recipe.module';
import { RECIPE_SERVICE_CONFIG } from '@app/shared';

async function bootstrap(): Promise<void> {
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
