import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface RequestData {
  method: string;
  url: string;
  body: unknown;
  query: unknown;
  params: unknown;
  headers: Record<string, unknown>;
}

interface ResponseData {
  statusCode: number;
}

interface ErrorData {
  message: string;
  stack?: string;
}

@Injectable()
export class MicroserviceLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('MicroserviceGateway');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestData>();
    const response = httpContext.getResponse<ResponseData>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { method, url, body, query, params, headers } = request;
    const startTime = Date.now();

    this.logger.log(
      `[REQUEST] ${method} ${url}`,
      //   JSON.stringify({
      //     method,
      //     url,
      //     body: this.sanitizeBody(body),
      //     query,
      //     params,
      //     headers: this.sanitizeHeaders(headers),
      //     timestamp: new Date().toISOString(),
      //   }),
    );

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        this.logger.log(
          `[RESPONSE] ${method} ${url} - Status: ${response.statusCode} - Time: ${responseTime}ms`,
        );
      }),
      catchError((error: ErrorData) => {
        const responseTime = Date.now() - startTime;
        this.logger.error(
          `[ERROR] ${method} ${url} - ${responseTime}ms`,
          JSON.stringify({
            method,
            url,
            error: error.message,
            stack: error.stack,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toLocaleString(),
          }),
        );
        return throwError(() => error);
      }),
    );
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;
    const sanitized = { ...(body as Record<string, unknown>) };
    // Remove sensitive fields
    if ('password' in sanitized) sanitized.password = '[REDACTED]';
    if ('token' in sanitized) sanitized.token = '[REDACTED]';
    return sanitized;
  }

  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const sanitized = { ...headers };
    // Remove sensitive headers
    if ('authorization' in sanitized) sanitized.authorization = '[REDACTED]';
    if ('Authorization' in sanitized) sanitized.Authorization = '[REDACTED]';
    return sanitized;
  }
}
