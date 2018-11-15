/** BOILERPLATE - don't touch unless you are brave */
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { PrivilegeGuard } from './controller/privilege.guard';
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';
import { PrivilegeService } from './services/privilege.service';
import { AuthService } from './auth/auth.service';
import { AuthStrategy } from './auth/auth.jwt.strategy';
import {
  EntityProvider,
  MakeDatabaseProvider,
  MakeRepositoryProviders,
} from './core/core.database.provider';
import { LoggingInterceptor } from './controller/logging.interceptor';
import { HttpExceptionFilter } from './controller/exception.filter';
import { FactoryProvider } from '@nestjs/common/interfaces';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [

    //Services
    ConfigService,
    AuthService,
    UserService.Service,
    RoleService.Service,
    PrivilegeService.Service,

    //Auth Middleware
    AuthStrategy,

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
    
    //Services
    ConfigService,
    AuthService,
    UserService.Service,
    RoleService.Service,
    PrivilegeService.Service,

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
