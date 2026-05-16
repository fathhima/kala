import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

type HttpErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as HttpErrorResponse | string;

    let message = 'Something went wrong';

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (Array.isArray(errorResponse?.message)) {
      message = errorResponse.message.join(', ');
    } else if (typeof errorResponse?.message === 'string') {
      message = errorResponse.message;
    }

    response.status(status).json({
      success: false,
      message,
      error: { code: exception.name },
      statusCode: status,
    });
  }
}