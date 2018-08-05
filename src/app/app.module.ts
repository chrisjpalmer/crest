/** SORT OF BOILERPLATE - you may touch if you are feeling brave */
import {
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import {
  CoreWebModule,
  AuthRoutes,
} from 'core';
import { Entities as CoreEntities } from 'database';
import * as passport from 'passport';
import { InitController } from './routes/init/init.controller';
import { LoginController } from './routes/login/login.controller';
import { LogoutController } from './routes/logout/logout.controller';
import { UserController, UserSyncController } from './routes/authenticated/user/user.controller';
import { PrivilegeController, PrivilegeSyncController } from './routes/authenticated/privilege/privilege.controller';
import { RoleController, RoleSyncController } from './routes/authenticated/role/role.controller';

@Module({
  imports: [
    CoreWebModule.forRoot(CoreEntities), //imports important things like RoleGuard, GeneralAuth and ConfigService
  ],
  controllers: [
    // /init
    InitController,
    // /login
    LoginController,
    // /logout
    LogoutController,

    // /authenticated

    // /autheticated/user
    UserController,
    UserSyncController,

    // /autheticated/privilege
    PrivilegeController,
    PrivilegeSyncController,

    // /autheticated/role
    RoleController,
    RoleSyncController,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    //DO NOT BE DECIEVED -> forRoutes does not take an array argument
    //It is a variadic function!
    consumer.apply(passport.authenticate('jwt', { session: false })).forRoutes(
      //AuthRoutes is a constant defined in core which identifies all authenticated routes
      //A controller can become part of the authenticated routes by using the @AuthController decorator
      //which automatically prepends the AuthPrefix constant to the route.
      AuthRoutes,
    );
  }
}
//TODO lint the code on commit
