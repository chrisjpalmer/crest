import {
  NestInterceptor,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { shareReplay, map, catchError } from 'rxjs/operators'
import { CoreRequest } from '../core/core.util';
import { RequestLog, RequestLogToken, UserToken, User } from 'database';
import { Repository } from 'typeorm';
import { InjectRepo } from '../core/core.database.provider';
import { RequestLogModel } from 'database/core/request.log.model';

export class RequestDetails {
  uri: string;
  ipAddress: string;
  userId?: number;
  sessionId?: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  error?:string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectRepo(RequestLogToken)
    private requestLogRepository: Repository<RequestLog>,
    @InjectRepo(UserToken)
    private userRepository: Repository<User>,
  ) { }

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
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Promise<Observable<any>> {
    const request: CoreRequest = context.switchToHttp().getRequest();

    let hasUser = !!request.user;

    //Acquire the pre request data
    let requestLogModel = RequestLogModel.createNew(this.requestLogRepository);
    let requestDetails: RequestDetails = {
      uri: request['originalUrl'],
      ipAddress: request.connection.remoteAddress,
      startTime: new Date(),
      endTime: null,
      duration: null,
      error:null,
    };
    if (hasUser) {
      requestDetails.userId = request.user.userData.id,
      requestDetails.sessionId = request.user.sessionId
    }

    //Commit the pre request data to the database
    if (hasUser) {
      requestLogModel.setPreRequestWithUser(requestDetails.startTime, requestDetails.ipAddress, requestDetails.uri, requestDetails.userId, this.userRepository);
    } else {
      requestLogModel.setPreRequest(requestDetails.startTime, requestDetails.ipAddress, requestDetails.uri);
    }
    await requestLogModel.save();

    //Log it to the output
    await this.logPreRequestDetails(requestDetails);


    /**
     * Post request
     */
    stream$ = stream$.pipe(shareReplay());
    stream$
    .pipe(
      map(() => {
        return { error: null };
      }),
      catchError((error) => {
        return of({ error })
      })
    )
    .subscribe(
      async (state) => {
        requestDetails.endTime = new Date();
        requestDetails.duration = requestDetails.endTime.getTime() - requestDetails.startTime.getTime();

        //Did we encounter an error
        if (!!state.error) {
          if (state.error instanceof HttpException) {
            requestDetails.error = JSON.stringify(state.error.getResponse());
          } else {
            requestDetails.error = state.error.toString();
          }
        }

        //Commit post data request to the database
        if (!!requestDetails.error) {
          requestLogModel.setPostRequestException(requestDetails.endTime, requestDetails.duration, requestDetails.error);
        } else {
          requestLogModel.setPostRequest(requestDetails.endTime, requestDetails.duration);
        }

        await requestLogModel.save();

        //Log it to the output
        await this.logPostRequestDetails(requestDetails);
      },
  );

    return stream$;
  }

  async logPreRequestDetails(requestDetails: RequestDetails) {

    //LOG
    console.log(
      `REQUEST ${requestDetails.ipAddress} => START: ${
      requestDetails.uri
      } - TIME: ${requestDetails.startTime.toISOString()}`,
    );
  }

  async logPostRequestDetails(requestDetails: RequestDetails) {

    //LOG
    console.log(
      `REQUEST ${requestDetails.ipAddress} => END: ${
      requestDetails.uri
      } - TIME: ${requestDetails.endTime.toISOString()} - DURATION: ${
      requestDetails.duration
      }ms` + (requestDetails.error ? ` - ERROR: ${requestDetails.error}` : ''),
    );
  }
}
