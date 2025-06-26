import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  MicroserviceConfig,
} from '../config/app.config';

/**
 * Application configuration service providing typed access to configuration values.
 * This service acts as a wrapper around the NestJS ConfigService with proper typing.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get application configuration
   */
  getAppConfig(): AppConfig {
    return this.configService.get<AppConfig>('app')!;
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): DatabaseConfig {
    return this.configService.get<DatabaseConfig>('database')!;
  }

  /**
   * Get JWT configuration
   */
  getJwtConfig(): JwtConfig {
    return this.configService.get<JwtConfig>('jwt')!;
  }

  /**
   * Get microservices configuration
   */
  getMicroserviceConfig(): MicroserviceConfig {
    return this.configService.get<MicroserviceConfig>('microservices')!;
  }

  /**
   * Check if the application is running in production mode
   */
  isProduction(): boolean {
    return this.getAppConfig().isProduction;
  }

  /**
   * Check if the application is running in development mode
   */
  isDevelopment(): boolean {
    return this.getAppConfig().isDevelopment;
  }

  /**
   * Get the current node environment
   */
  getNodeEnv(): string {
    return this.getAppConfig().nodeEnv;
  }
}
