import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins (configure appropriately for production)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.MAIN_PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API Gateway is running on port ${port}`);
  console.log(`📡 Available routes:`);
  console.log(`   - Auth: http://localhost:${port}/api/v1/auth`);
  console.log(`   - Recipes: http://localhost:${port}/api/v1/recipes`);
  console.log(`   - Users: http://localhost:${port}/api/v1/users`);
}

void bootstrap();
