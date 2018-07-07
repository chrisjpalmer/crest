/** BOILERPLATE - don't touch unless you are brave */
import * as passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../entity.service/user.service';
import { PrivilegeService } from '../entity.service/privilege.service';
import { RoleService } from '../entity.service/role.service';
import { CoreRequest } from '../core/core.util';
import { ConfigService } from '../service/config.service';

@Injectable()
export class AuthStrategy extends Strategy {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly privilegeService: PrivilegeService,
    private readonly roleService: RoleService,
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

  public async verify(req: CoreRequest, payload, done) {
    try {
      //This function wil return the user which corresponds to
      //the jwt token.
      //However the user will not have any privileges in their object
      //we don't do this automatically for speed purposes
      //lets fill the user object now.
      let user = await this.authService.authenticateUserToken(payload);

      //Get all privileges
      let privileges = await this.privilegeService.findIndexed(null, s =>
        this.privilegeService.applyStemsRoles(s),
      );

      //Get the user's role and embed the privileges inside.
      let role = await this.roleService.findById(user.role.id, query =>
        this.roleService.applyStemsPrivileges(query),
      );
      this.roleService.fillWithPrivileges(role, privileges);

      //Embed the role in the user object
      user.role = role;

      //call the done function to signal that we have succeeded.
      //what we pass back to this function will be embeded in the request.user property.
      //other parts of our application will use this to determine the requesting user.
      done(null, user);
    } catch (e) {
      done(e, false);
    }
  }
}
