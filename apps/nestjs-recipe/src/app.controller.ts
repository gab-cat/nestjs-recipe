import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'API Gateway health check',
    description:
      'Health check endpoint for the API Gateway. Returns service status and basic information.',
  })
  @ApiOkResponse({
    description: 'API Gateway is operational',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        message: { type: 'string', example: 'NestJS Recipe API Gateway' },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-12-01T10:00:00.000Z',
        },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getHello(): {
    status: string;
    message: string;
    timestamp: string;
    version?: string;
  } {
    return this.appService.getHello();
  }
}
