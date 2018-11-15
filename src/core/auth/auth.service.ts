/** BOILERPLATE - don't touch unless you are brave */
import * as jwt from 'jsonwebtoken';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Session, SessionToken, User, UserToken, SessionModel, UserModel, UserPassword, UserPasswordModel, UserPasswordToken } from 'database';
import { ConfigService } from '../services';
import { InjectRepo } from '../core/core.database.provider';


export class SessionJwtPayload {
  userId: number;
  sessionId: number;
}

export class SessionJwtOptions {
  expiresIn?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepo(SessionToken)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
    @InjectRepo(UserPasswordToken) private readonly userPasswordRespository:  Repository<UserPassword>,
  ) { }

  /**
   * create a new token/session key for the user and store the session key id in the
   * database as a record of the user's activity
   * @param userId
   */
  async createUserSession(userId: number) : Promise<string> {
    let sessionModel: SessionModel = SessionModel.createNew(this.sessionRepository);
    sessionModel.setUserId(userId, this.userRepository);
    let sessionId = await sessionModel.save();



    //Get the expiry time of the token
    let payload: SessionJwtPayload = { userId: userId, sessionId: sessionId };
    let jwtoptions: SessionJwtOptions = {};
    let token = jwt.sign(payload, this.configService.auth.key, jwtoptions);

    return token;
  }

  /**
   * deletes the user's session to effectively logout the user.
   * @param sessionId should be the sessionId that was provided in the JWT token
   */
  async deleteUserSession(sessionId:number) {
    let sessionModel: SessionModel = await SessionModel.forSessionId(sessionId, this.sessionRepository);
    await sessionModel.delete();
  }

  /**
   * authenticatedUserCred is called by a login controller
   * its job is to verify the user's credentials
   * if success it returns the user object
   * if failure, it throws an Unauthroized exception
   * @param username
   * @param password
   */
  async validatePassword(
    username: string,
    password: string,
  ): Promise<number> {
    let userModel: UserModel;
    try {
      userModel = await UserModel.forUsername(username, this.userRepository);
    } catch (e) {
      throw new NotFoundException('user does not exist');
    }

    let userId = userModel.getId();

    let userPasswordModel: UserPasswordModel;
    try {
      userPasswordModel = await UserPasswordModel.forUserId(userId, this.userPasswordRespository, this.configService.auth.saltRounds);
    } catch (e) {
      throw new ForbiddenException(`user's password is not set`);
    }

    try {
      await userPasswordModel.validatePassword(password);
    } catch (e) {
      throw new UnauthorizedException(`the user's password is incorrect`);
    }

    return userId;
  }

  /**
   * authenticateUserToken is called by passport
   * exceptions here do not need to be 'NestExceptions'
   * every exception is translated to an authentication error
   * 
   * returns the userId
   * @param authPayload
   */
  async validateSession(sessionPayload: SessionJwtPayload) {
    let sessionModel: SessionModel;
    try {
      sessionModel = await SessionModel.forSessionId(sessionPayload.sessionId, this.sessionRepository);
    } catch (e) {
      throw new ForbiddenException('the user session does not exist');
    }
    if (sessionModel.getUserId() !== sessionPayload.userId) {
      throw new ForbiddenException('the session id does not match the user id of the jwt token');
    }
    if (sessionModel.isExpired(this.configService.auth.expiry)) {
      throw new ForbiddenException('the session has expired');
    }

    sessionModel.updateLastUsed();

    await sessionModel.save();

    return sessionPayload.userId;
  }
}

