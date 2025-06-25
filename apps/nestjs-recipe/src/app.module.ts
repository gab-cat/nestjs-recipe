import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGateway } from './gateways/auth.gateway';
import { RecipeGateway } from './gateways/recipe.gateway';
import { UsersGateway } from './gateways/users.gateway';
import { MICROSERVICE_HOSTS, MICROSERVICE_PORTS } from '@app/shared';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host:
            process.env.NODE_ENV === 'production'
              ? MICROSERVICE_HOSTS.AUTH_SERVICE
              : 'localhost',
          port: MICROSERVICE_PORTS.AUTH_SERVICE,
        },
      },
      {
        name: 'RECIPE_SERVICE',
        transport: Transport.TCP,
        options: {
          host:
            process.env.NODE_ENV === 'production'
              ? MICROSERVICE_HOSTS.RECIPE_SERVICE
              : 'localhost',
          port: MICROSERVICE_PORTS.RECIPE_SERVICE,
        },
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host:
            process.env.NODE_ENV === 'production'
              ? MICROSERVICE_HOSTS.USERS_SERVICE
              : 'localhost',
          port: MICROSERVICE_PORTS.USERS_SERVICE,
        },
      },
    ]),
  ],
  controllers: [AppController, AuthGateway, RecipeGateway, UsersGateway],
  providers: [AppService],
})
export class AppModule {}
