/** BOILERPLATE - don't touch unless you are brave */
import * as passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { AuthService, SessionJwtPayload } from './auth.service';
import { UserService } from '../entity.service/user.service';
import { CoreRequest } from '../core/core.util';
import { ConfigService } from '../service/config.service';
import { AuthUserServiceOutput } from './auth.class';

@Injectable()
export class AuthStrategy extends Strategy {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true,
        secretOrKey: configService.auth.key,
      },
      async (req, payload, next) => await this.verify(req, payload, next),
    );
    passport.use('jwt', this);
  }

  public async verify(req: CoreRequest, payload:SessionJwtPayload, done) {
    try {
      
      //Validate that the user's session is valid
      await this.authService.validateSession(payload);

      //Get the UserServiceOutput
      let userData = await this.userService.getUserData(payload.userId);

      let authUserServiceOutput:AuthUserServiceOutput = {
        sessionId: payload.sessionId,
        userData: userData
      }

      //Call done, pass the user. Now the user is embeded in the request object.
      done(null, authUserServiceOutput);
    } catch (e) {
      done(e, false);
    }
  }
}
