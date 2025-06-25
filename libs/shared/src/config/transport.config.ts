import { Transport, TcpOptions } from '@nestjs/microservices';

export const MICROSERVICE_PORTS = {
  AUTH_SERVICE: 4001,
  RECIPE_SERVICE: 4002,
  USERS_SERVICE: 4003,
};

export const MICROSERVICE_HOSTS = {
  AUTH_SERVICE:
    process.env.NODE_ENV === 'production'
      ? process.env.AUTH_SERVICE_HOST
      : 'localhost',
  RECIPE_SERVICE:
    process.env.NODE_ENV === 'production'
      ? process.env.RECIPE_SERVICE_HOST
      : 'localhost',
  USERS_SERVICE:
    process.env.NODE_ENV === 'production'
      ? process.env.USERS_SERVICE_HOST
      : 'localhost',
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

// Client configurations for connecting to microservices (used by gateway)
export const getAuthServiceClientConfig = (): TcpOptions =>
  getTransportConfig(
    Number(process.env.AUTH_SERVICE_PORT) || MICROSERVICE_PORTS.AUTH_SERVICE,
    process.env.NODE_ENV === 'production'
      ? process.env.AUTH_SERVICE_HOST
      : 'localhost',
  );

export const getRecipeServiceClientConfig = (): TcpOptions =>
  getTransportConfig(
    Number(process.env.RECIPE_SERVICE_PORT) ||
      MICROSERVICE_PORTS.RECIPE_SERVICE,
    process.env.NODE_ENV === 'production'
      ? process.env.RECIPE_SERVICE_HOST
      : 'localhost',
  );

export const getUsersServiceClientConfig = (): TcpOptions =>
  getTransportConfig(
    Number(process.env.USERS_SERVICE_PORT) || MICROSERVICE_PORTS.USERS_SERVICE,
    process.env.NODE_ENV === 'production'
      ? process.env.USERS_SERVICE_HOST
      : 'localhost',
  );
