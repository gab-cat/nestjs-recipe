import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGateway } from './gateways/auth.gateway';
import { RecipeGateway } from './gateways/recipe.gateway';
import { UsersGateway } from './gateways/users.gateway';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  microserviceConfig,
  SharedModule,
  MicroserviceConfig,
  MicroserviceLoggingInterceptor,
} from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, microserviceConfig],
    }),
    SharedModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => {
          const microserviceConf =
            configService.get<MicroserviceConfig>('microservices')!;
          return {
            transport: Transport.TCP,
            options: {
              host: microserviceConf.authService.host,
              port: microserviceConf.authService.port,
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'RECIPE_SERVICE',
        useFactory: (configService: ConfigService) => {
          const microserviceConf =
            configService.get<MicroserviceConfig>('microservices')!;
          return {
            transport: Transport.TCP,
            options: {
              host: microserviceConf.recipeService.host,
              port: microserviceConf.recipeService.port,
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'USERS_SERVICE',
        useFactory: (configService: ConfigService) => {
          const microserviceConf =
            configService.get<MicroserviceConfig>('microservices')!;
          return {
            transport: Transport.TCP,
            options: {
              host: microserviceConf.usersService.host,
              port: microserviceConf.usersService.port,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AppController, AuthGateway, RecipeGateway, UsersGateway],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MicroserviceLoggingInterceptor,
    },
  ],
})
export class AppModule {}
