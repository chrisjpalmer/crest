/** BOILERPLATE - don't touch unless you are brave */
import * as jwt from 'jsonwebtoken';
import {
  Component,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository, Timestamp } from 'typeorm';
import { Session, SessionToken, User, UserToken } from 'database';
import { AuthPayload, AuthOptions } from './auth.class';
import { ConfigService } from '../service/config.service';
import { UserService } from '../entity.service/user.service';
import { InjectRepo } from '../core/core.database.provider';
import * as bcrypt from 'bcrypt';
import { CryptoService } from './crypto.service';

@Component()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly cryptoService: CryptoService,
    @InjectRepo(SessionToken)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * create a new token/session key for the user and store the session key id in the
   * database as a record of the user's activity
   * @param userId
   */
  async createUserToken(userId: number) {
    //Save the new session in the database against the user
    let session = this.sessionRepository.create();
    session.user = new User();
    session.user.id = userId;
    session.lastUsed = new Date();
    await this.sessionRepository.save(session);

    //Get the expiry time of the token
    let payload: AuthPayload = { userId: userId, sessionId: session.id };
    let jwtoptions: AuthOptions = {};
    let token = jwt.sign(payload, this.configService.auth.key, jwtoptions);

    return {
      access_token: token,
    };
  }

  /**
   * deletes the user's session to effectively logout the user.
   * @param sessionId should be the sessionId that was provided in the JWT token
   */
  async deleteUserSession(session: Session) {
    await this.sessionRepository.delete(session.id);
  }

  /**
   * authenticatedUserCred is called by a login controller
   * its job is to verify the user's credentials
   * if success it returns the user object
   * if failure, it throws an Unauthroized exception
   * @param username
   * @param password
   */
  async authenticatedUserCred(
    username: string,
    password: string,
  ): Promise<User> {
    let user: User = null;
    try {
      //TODO: Consider whether this could be done more succintly with just
      // userPasswordRepository
      user = await this.userRepository
        .createQueryBuilder('user')
        .select('user.id')
        .innerJoinAndSelect('user.userPassword', 'userPassword')
        .where('user.username = :username', {
          username: username,
        })
        .getOne();
      //Why does this query work? Because innerJoinAndSelect 'adds' the selection to the previous selection,
      //the equivalent of innerJoinAndSelect is innerJoin().addSelect()
      if (!user) {
        throw new NotFoundException('user does not exist');
      }
    } catch (e) {
      throw new NotFoundException('user does not exist');
    }

    let result = await this.cryptoService.validatePassword(
      user.userPassword.hash,
      password,
    );
    if (!result) {
      throw new UnauthorizedException('the password provided is invalid');
    }

    return user;
  }

  /**
   * authenticateUserToken is called by passport
   * exceptions here do not need to be 'NestExceptions'
   * every exception is translated to an authentication error
   * @param authPayload
   */
  async authenticateUserToken(authPayload: AuthPayload): Promise<User> {
    //Lookup the session object which gets us details about
    //the user's session
    let session = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.id = :sessionId AND session.user_id = :userId', {
        sessionId: authPayload.sessionId,
        userId: authPayload.userId,
      })
      .getOne();

    if (!session) {
      throw new ForbiddenException('the user session did not exist');
    }

    //Has this session expired?
    let expired =
      session.lastUsed.getTime() + this.configService.auth.expiry * 1000 <
      new Date().getTime();
    if (expired) {
      throw new ForbiddenException('the session has expired');
    }

    //--------------------------
    //The session is valid..
    //--------------------------

    //This causes the updatedAt key to be increased
    //Calling the save method won't work even if you force the timestamp to update
    //This is because typeORM detects that you have not changed any content and will not updated the updatedAt timestamp
    session.lastUsed = new Date();
    await this.sessionRepository.save(session);

    let userToReturn = await this.userService.findById(authPayload.userId, (s) => this.userService.applyStemsRole(s));
    userToReturn.currentSession = session;

    return userToReturn;
  }
}
