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
import { UserController } from './routes/authenticated/user/user.controller';
import { MessageCategoryController } from './routes/authenticated/message/category/message.category.controller';
import { MessageCategoryService } from './routes/authenticated/message/category/message.category.service';

@Module({
  imports: [
    CoreWebModule.forRoot(CoreEntities), //imports important things like RoleGuard, GeneralAuth and ConfigService
  ],
  controllers: [
    // /init
    InitController,
    // /login
    LoginController,

    // /authenticated

    // /autheticated/user
    UserController,

    // /authenticated/message/category
    MessageCategoryController,
  ],
  components: [, MessageCategoryService],
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
