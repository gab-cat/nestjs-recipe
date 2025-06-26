import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
}

export interface MicroserviceConfig {
  authService: {
    host: string;
    port: number;
  };
  recipeService: {
    host: string;
    port: number;
  };
  usersService: {
    host: string;
    port: number;
  };
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production',
  }),
);

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/recipe_db',
  }),
);

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  }),
);

export const microserviceConfig = registerAs(
  'microservices',
  (): MicroserviceConfig => {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProduction = nodeEnv === 'production';

    return {
      authService: {
        host: isProduction
          ? process.env.AUTH_SERVICE_HOST || 'auth-service'
          : 'localhost',
        port: Number(process.env.AUTH_SERVICE_PORT) || 4001,
      },
      recipeService: {
        host: isProduction
          ? process.env.RECIPE_SERVICE_HOST || 'recipe-service'
          : 'localhost',
        port: Number(process.env.RECIPE_SERVICE_PORT) || 4002,
      },
      usersService: {
        host: isProduction
          ? process.env.USERS_SERVICE_HOST || 'users-service'
          : 'localhost',
        port: Number(process.env.USERS_SERVICE_PORT) || 4003,
      },
    };
  },
);
