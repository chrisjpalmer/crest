/** BOILERPLATE - don't touch unless you are brave */
import * as passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { AuthService, SessionJwtPayload } from './auth.service';
import { CoreRequest } from '../core/core.util';
import { ConfigService } from '../services';


@Injectable()
export class AuthStrategy extends Strategy {
  constructor(
    private readonly authService: AuthService,

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

      //Get user information
      let user = null;

      //Call done, pass the user. Now the user is embeded in the request object.
      done(null, user);
    } catch (e) {
      done(e, false);
    }
  }
}
