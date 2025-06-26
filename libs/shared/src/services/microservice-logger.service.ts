import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class MicroserviceLoggerService {
  private readonly logger = new Logger('MicroserviceClient');

  logAndSend<T>(
    client: ClientProxy,
    pattern: string | { cmd: string },
    data: unknown,
    context?: string,
  ): Observable<T> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const patternString = typeof pattern === 'string' ? pattern : pattern.cmd;
    const microserviceName = context?.split('.')[0];

    // this.logger.log(
    //   `[${requestId}] Sending to microservice - Pattern: ${patternString}`,
    //   JSON.stringify({
    //     requestId,
    //     pattern: patternString,
    //     data: this.sanitizeData(data),
    //     context,
    //     timestamp: new Date().toISOString(),
    //   }),
    // );

    return client.send<T>(pattern, data).pipe(
      tap((response: T) => {
        const responseTime = Date.now() - startTime;
        this.logger.log(
          // it should tell the name of the microservice it was received from
          `[${microserviceName}] ${patternString} - ${responseTime}ms | ID:${requestId}`,
          JSON.stringify({
            requestId,
            success: true,
            data: this.sanitizeData(data),
            responseSize: JSON.stringify(response).length,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
          }),
        );
      }),
      catchError((error: unknown) => {
        const responseTime = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.logger.error(
          `[${microserviceName}] ERROR in ${patternString} - ${responseTime}ms | ID:${requestId}`,
          JSON.stringify({
            requestId,
            success: false,
            pattern: patternString,
            error: errorMessage,
            stack: errorStack,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
          }),
        );
        return throwError(() => error);
      }),
    );
  }

  logClientConnection(serviceName: string, host: string, port: number): void {
    this.logger.log(
      `Connecting to ${serviceName}`,
      JSON.stringify({
        serviceName,
        host,
        port,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...(data as Record<string, unknown>) };

    // Remove sensitive fields
    if ('password' in sanitized) sanitized.password = '[REDACTED]';
    if ('token' in sanitized) sanitized.token = '[REDACTED]';
    if ('authorization' in sanitized) sanitized.authorization = '[REDACTED]';

    return sanitized;
  }
}
