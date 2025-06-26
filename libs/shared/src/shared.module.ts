import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedService } from './shared.service';
import { PrismaService } from './services/prisma.service';
import { AppConfigService } from './services/config.service';
import { MicroserviceLoggerService } from './services/microservice-logger.service';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  microserviceConfig,
} from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, microserviceConfig],
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  providers: [
    SharedService,
    PrismaService,
    AppConfigService,
    MicroserviceLoggerService,
  ],
  exports: [
    SharedService,
    PrismaService,
    AppConfigService,
    MicroserviceLoggerService,
  ],
})
export class SharedModule {}
