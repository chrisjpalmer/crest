import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { ConfigService } from '../service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private configService:ConfigService) {
        
    }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) { 
        response.status(exception.getStatus()).json({
            statusCode: exception.getStatus(),
            message: exception.getResponse()
        });
        return;
    }

    /**
     * Handle Exceptions
     * In debug mode, expose the error code properly to the outside world by converting the exception to a HttpException
     */
    if (this.configService.app.debug) {
        response.status(500).json({
            statusCode: 500,
            message: exception.toString(),
        });
    } else {
        response.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
  }
}