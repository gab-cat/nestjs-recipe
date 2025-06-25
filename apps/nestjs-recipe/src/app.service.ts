import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): {
    status: string;
    message: string;
    timestamp: string;
    version?: string;
  } {
    return {
      status: 'ok',
      message: 'NestJS Recipe App service is working',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    };
  }
}
