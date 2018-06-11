import {
  Interceptor,
  NestInterceptor,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { ConfigService } from '../service/config.service';
import { HttpException } from '@nestjs/core';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import { CoreRequest } from '../core/core.util';
import { User, RequestLog, RequestLogToken } from 'database';
import { Repository } from 'typeorm';
import { InjectRepo } from '../core/core.database.provider';

//TODO: Test exception mapping
//TODO: Fix message delete method
//TODO: Add exceptions to the log output
//TODO: Log the full input and output to the database -> also introduce cleanup

@Interceptor()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private configService: ConfigService,
    @InjectRepo(RequestLogToken)
    private requestLogRepository: Repository<RequestLog>,
  ) {}

  /**
   * intercept is called by Nest. Nest passes the request object, exection context and an observable.
   * The observable will emit an event when the main request handler has finished.
   * intercept itself is called before before the request handler.
   * By operating on this event stream we can efffectively "intercept" the post-request event stream and perform useful
   * logging operations.
   *
   * This logging interceptor writes to the console AND also submits the logging data to the database.
   * @param request
   * @param context
   * @param stream$
   */
  async intercept(
    request: CoreRequest,
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Promise<Observable<any>> {
    /**
     * Get requestLog object
     * Registers a log in the database
     */
    let requestLog = await this.preLog(request, context);

    /**
     * Perform logging
     */
    stream$.subscribe(
      async () => {
        await this.postLog(requestLog);
      },
      async err => {
        await this.postLog(requestLog, err);
      },
    );

    /**
     * Handle Exceptions
     * In debug mode, expose the error code properly to the outside world by converting the exception to a HttpException
     */
    if (this.configService.app.debug) {
      //In debug mode, expose the exception directly to the output.
      stream$ = stream$.catch(err => {
        if (err.getStatus !== undefined) {
          //Test is it of HttpException class?
          return Observable.throw(err); //Just throw the exception if we already have an HTTP exception
        } else {
          return Observable.throw(
            new InternalServerErrorException(err.toString()),
          );
        }
      });
    } else {
      //In prod mode, do not expose exception directly except the special HttpExceptions (which the default exception filter will handle)
    }

    return stream$;
  }

  async preLog(
    request: CoreRequest,
    executionContext: ExecutionContext,
  ): Promise<RequestLog> {
    let requestLog = new RequestLog();
    requestLog.startTime = new Date();
    requestLog.uri = request['originalUrl'];
    requestLog.ipAddress = request.connection.remoteAddress;
    if (!!request.user) {
      requestLog.user = request.user;
    }

    //SAVE AND LOG
    await this.requestLogRepository.save(requestLog);
    console.log(
      `REQUEST ${requestLog.ipAddress} => START: ${
        requestLog.uri
      } - TIME: ${requestLog.startTime.toISOString()}`,
    );

    return requestLog;
  }

  async postLog(requestLog: RequestLog, exception?: any) {
    requestLog.endTime = new Date();
    requestLog.duration =
      requestLog.endTime.getTime() - requestLog.startTime.getTime();

    //SAVE AND LOG
    await this.requestLogRepository.save(requestLog);
    console.log(
      `REQUEST ${requestLog.ipAddress} => END: ${
        requestLog.uri
      } - TIME: ${requestLog.endTime.toISOString()} - DURATION: ${
        requestLog.duration
      }ms`,
    );
  }
}
