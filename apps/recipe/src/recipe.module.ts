import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { SharedModule, MICROSERVICE_PORTS } from '@app/shared';

@Module({
  imports: [
    SharedModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: MICROSERVICE_PORTS.AUTH_SERVICE,
        },
      },
    ]),
  ],
  controllers: [RecipeController],
  providers: [RecipeService],
})
export class RecipeModule {}
