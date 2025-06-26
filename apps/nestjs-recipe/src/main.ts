import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from 'libs/shared/filters/http-exception.filter';
import {
  createSwaggerConfig,
  SWAGGER_UI_CONFIG,
  SWAGGER_ROUTE,
  isSwaggerEnabled,
} from 'libs/shared/src/config/swagger.config';

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

  // Set up global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configure Swagger Documentation (only in development)
  if (isSwaggerEnabled()) {
    const document = SwaggerModule.createDocument(
      app,
      createSwaggerConfig() as OpenAPIObject,
    );
    SwaggerModule.setup(SWAGGER_ROUTE, app, document, SWAGGER_UI_CONFIG);
  }

  const port = process.env.MAIN_PORT || 3000;

  await app.listen(port);

  console.log(`🚀 API Gateway is running on port ${port}`);

  if (isSwaggerEnabled()) {
    console.log(
      `📖 API Documentation: http://localhost:${port}/${SWAGGER_ROUTE}`,
    );
  }

  // Log microservice connection configuration
  console.log('🔧 Gateway Microservice Configuration:');
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `   - Auth Service: ${process.env.NODE_ENV === 'production' ? process.env.AUTH_SERVICE_HOST || 'auth-service' : 'localhost'}:${process.env.AUTH_SERVICE_PORT || 4001}`,
  );
  console.log(
    `   - Recipe Service: ${process.env.NODE_ENV === 'production' ? process.env.RECIPE_SERVICE_HOST || 'recipe-service' : 'localhost'}:${process.env.RECIPE_SERVICE_PORT || 4002}`,
  );
  console.log(
    `   - Users Service: ${process.env.NODE_ENV === 'production' ? process.env.USERS_SERVICE_HOST || 'users-service' : 'localhost'}:${process.env.USERS_SERVICE_PORT || 4003}`,
  );
}

void bootstrap();
