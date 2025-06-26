import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const error =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : exceptionResponse;

    response.status(status).json({
      ...error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof RpcException) {
      const error = exception.getError();
      status =
        typeof error === 'object' && error !== null && 'statusCode' in error
          ? (error as { statusCode: number }).statusCode
          : HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : 'Internal server error';
    } else if (typeof exception === 'object' && exception !== null) {
      status =
        'statusCode' in exception
          ? (exception as { statusCode: number }).statusCode ||
            HttpStatus.INTERNAL_SERVER_ERROR
          : HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        'message' in exception
          ? (exception as { message: string }).message
          : 'Internal server error';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : typeof message === 'object' &&
              message !== null &&
              'message' in message
            ? (message as { message: string }).message
            : message,
    });
  }
}
