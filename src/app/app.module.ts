/** SORT OF BOILERPLATE - you may touch if you are feeling brave */
import {
  Module,
  NestModule,
  MiddlewaresConsumer,
  RequestMethod,
} from '@nestjs/common';
import {
  CoreWebModule,
  MakeRepositoryProviders,
  MakeDatabaseProvider,
  AuthStrategy,
  AuthRoutes,
} from 'core';
import { Entities as CoreEntities } from 'database';
import * as passport from 'passport';
import { InitController } from './routes/init/init.controller';
import { LoginController } from './routes/login/login.controller';
import { LogoutController } from './routes/logout/logout.controller';
import { UserController } from './routes/authenticated/user/user.controller';

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
  ],
  components: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
    //DO NOT BE DECIEVED -> forRoutes does not take an array argument
    //It is a variadic function!
    consumer.apply(passport.authenticate('jwt', { session: false })).forRoutes(
      //AuthRoutes is a constant defined in core which identifies all authenticated routes
      //A controller can become part of the authenticated routes by using the @AuthController decorator
      //which automatically prepends the AuthPrefix constant to the route.
      { path: AuthRoutes, method: RequestMethod.ALL },
    );
  }
}

//TODO lint the code on commit
