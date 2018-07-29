/** BOILERPLATE - don't touch unless you are brave */
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from './service/config.service';
import { PrivilegeGuard } from './controller/privilege.guard';
import { UserService } from './entity.service/user.service';
import { RoleService } from './entity.service/role.service';
import { PrivilegeService } from './entity.service/privilege.service';
import { AuthService } from './auth/auth.service';
import { AuthStrategy } from './auth/auth.jwt.strategy';
import {
  EntityProvider,
  MakeDatabaseProvider,
  MakeRepositoryProviders,
} from './core/core.database.provider';
import { CryptoService } from './auth/crypto.service';
import { LoggingInterceptor } from './controller/logging.interceptor';
import { HttpExceptionFilter } from './controller/exception.filter';
import { FactoryProvider } from '@nestjs/common/interfaces';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    //Config Service
    ConfigService,

    //Entity Services
    UserService,
    RoleService,
    PrivilegeService,

    //Auth Middleware
    CryptoService,
    AuthStrategy,
    AuthService,

    //Guards
    PrivilegeGuard,

    //Interceptors
    LoggingInterceptor,

    //ExceptionFilters,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
      inject: ['ConfigService']
    },
  ],
  exports: [
    //Config Service
    ConfigService,

    //Entity Services
    UserService,
    RoleService,
    PrivilegeService,

    //Auth Middleware
    CryptoService,
    AuthService,

    //Guards
    PrivilegeGuard,

    //Interceptors
    LoggingInterceptor,
  ],
})
export class CoreWebModule {
  static forRoot(...entityGroups: EntityProvider[][]): DynamicModule {
    let providers: FactoryProvider[] = [];

    //Database components...
    //First we import the database provider, passing any entities to it which we need created.
    providers.push(MakeDatabaseProvider(...entityGroups));
    //Second we pass the entities to this function so that all our entites get their own service class
    providers.push(...MakeRepositoryProviders(...entityGroups));
    return {
      module: CoreWebModule,
      providers: providers,
      exports: providers,
    };
  }
}
