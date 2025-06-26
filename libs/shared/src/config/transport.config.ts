import { Transport, TcpOptions } from '@nestjs/microservices';
import { AppConfigService } from '../services/config.service';

export const MICROSERVICE_PORTS = {
  AUTH_SERVICE: 4001,
  RECIPE_SERVICE: 4002,
  USERS_SERVICE: 4003,
};

export const getTransportConfig = (
  port: number,
  host?: string,
): TcpOptions => ({
  transport: Transport.TCP,
  options: {
    host: host || 'localhost',
    port,
  },
});

export const getTransportConfigForService = (
  port: number,
  host?: string,
): TcpOptions => ({
  transport: Transport.TCP,
  options: {
    // Microservices should bind to all interfaces in production (Docker)
    host:
      process.env.NODE_ENV === 'production' ? '0.0.0.0' : host || 'localhost',
    port,
  },
});

/**
 * Factory function to create transport configurations using the config service
 */
export const createTransportConfigs = (configService: AppConfigService) => {
  const microserviceConfig = configService.getMicroserviceConfig();

  return {
    AUTH_SERVICE_CONFIG: getTransportConfigForService(
      microserviceConfig.authService.port,
      microserviceConfig.authService.host,
    ),
    RECIPE_SERVICE_CONFIG: getTransportConfigForService(
      microserviceConfig.recipeService.port,
      microserviceConfig.recipeService.host,
    ),
    USERS_SERVICE_CONFIG: getTransportConfigForService(
      microserviceConfig.usersService.port,
      microserviceConfig.usersService.host,
    ),
  };
};

/**
 * Factory function to create client configurations for connecting to microservices
 */
export const createClientConfigs = (configService: AppConfigService) => {
  const microserviceConfig = configService.getMicroserviceConfig();

  return {
    getAuthServiceClientConfig: (): TcpOptions =>
      getTransportConfig(
        microserviceConfig.authService.port,
        microserviceConfig.authService.host,
      ),
    getRecipeServiceClientConfig: (): TcpOptions =>
      getTransportConfig(
        microserviceConfig.recipeService.port,
        microserviceConfig.recipeService.host,
      ),
    getUsersServiceClientConfig: (): TcpOptions =>
      getTransportConfig(
        microserviceConfig.usersService.port,
        microserviceConfig.usersService.host,
      ),
  };
};

// Legacy exports for backward compatibility (deprecated - use factory functions above)
// These will be removed in a future version
export const MICROSERVICE_HOSTS = {
  AUTH_SERVICE: 'localhost',
  RECIPE_SERVICE: 'localhost',
  USERS_SERVICE: 'localhost',
};

export const AUTH_SERVICE_CONFIG = getTransportConfig(
  MICROSERVICE_PORTS.AUTH_SERVICE,
  MICROSERVICE_HOSTS.AUTH_SERVICE,
);
export const RECIPE_SERVICE_CONFIG = getTransportConfig(
  MICROSERVICE_PORTS.RECIPE_SERVICE,
  MICROSERVICE_HOSTS.RECIPE_SERVICE,
);
export const USERS_SERVICE_CONFIG = getTransportConfig(
  MICROSERVICE_PORTS.USERS_SERVICE,
  MICROSERVICE_HOSTS.USERS_SERVICE,
);

export const getAuthServiceClientConfig = (): TcpOptions =>
  getTransportConfig(
    MICROSERVICE_PORTS.AUTH_SERVICE,
    MICROSERVICE_HOSTS.AUTH_SERVICE,
  );

export const getRecipeServiceClientConfig = (): TcpOptions =>
  getTransportConfig(
    MICROSERVICE_PORTS.RECIPE_SERVICE,
    MICROSERVICE_HOSTS.RECIPE_SERVICE,
  );

export const getUsersServiceClientConfig = (): TcpOptions =>
  getTransportConfig(
    MICROSERVICE_PORTS.USERS_SERVICE,
    MICROSERVICE_HOSTS.USERS_SERVICE,
  );
