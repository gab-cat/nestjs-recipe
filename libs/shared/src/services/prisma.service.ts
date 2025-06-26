import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../../generated/prisma/client';
import { AppConfigService } from './config.service';

/**
 * Service that provides a PrismaClient instance with NestJS lifecycle hooks.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: AppConfigService) {
    const databaseConfig = configService.getDatabaseConfig();
    super({
      datasources: {
        db: {
          url: databaseConfig.url,
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  enableShutdownHooks(): void {
    process.on('beforeExit', () => {
      void this.$disconnect();
    });
  }
}
