import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const details =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    if (status >= 500) {
      const message = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(message);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}
