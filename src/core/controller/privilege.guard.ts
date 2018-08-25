/** BOILERPLATE - don't touch unless you are brave */
import {
  CanActivate,
  ExecutionContext,
  ReflectMetadata,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CoreRequest } from '../core/core.util';
import { Reflector } from '@nestjs/core';
import { RoleServiceOutput, PrivilegeServiceOutput } from '../entity.service';

export const PrivilegeHas = (...privileges: string[]) =>
  ReflectMetadata('privileges', privileges);

@Injectable()
export class PrivilegeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request:CoreRequest = context.switchToHttp().getRequest();
    //Get the required privileges out of the metadata.
    const privileges =
      this.reflector.get<string[]>('privileges', context.getHandler()) || [];

    //Get the user data out of the request and get the user privileges.
    let user = request.user;
    let userRole: RoleServiceOutput = null;
    let userPrivileges: PrivilegeServiceOutput[] = [];
    if (user) userRole = user.userData.role;
    if (userRole) userPrivileges = userRole.privileges;

    //Ask whether some privileges are not satisfied.
    let somePrivilegesAreNotSatisfied = false;
    if (privileges.length == 0) {
      somePrivilegesAreNotSatisfied = false;
    } else {
      let hasRootPrivileges = !!userPrivileges.find(has => 'root' === has.name);
      if (hasRootPrivileges) {
        somePrivilegesAreNotSatisfied = false;
      } else {
        somePrivilegesAreNotSatisfied = privileges.some(
          required => !userPrivileges.find(has => required === has.name),
        );
      }
    }

    //If some privileges are not satisfied, don't authenticate the user
    if (somePrivilegesAreNotSatisfied) {
      return false;
    }

    //Otherwise do.
    return true;
  }
}

/*
Middleware
Guard
Interceptor
Pipe
    Controller
Inerceptor
 */
