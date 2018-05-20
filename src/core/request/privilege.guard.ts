/** BOILERPLATE - don't touch unless you are brave */
import {
  Guard,
  CanActivate,
  ExecutionContext,
  ReflectMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import { CoreRequest } from '../core/core.util';
import { Reflector } from '@nestjs/core';
import { Role, Privilege } from 'database';

export const PrivilegeHas = (...privileges: string[]) =>
  ReflectMetadata('privileges', privileges);

@Guard()
export class PrivilegeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    request: CoreRequest,
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //Get the required privileges out of the metadata.
    const { parent, handler } = context;
    const privileges =
      this.reflector.get<string[]>('privileges', handler) || [];

    //Get the user data out of the request and get the user privileges.
    let user = request.user;
    let userRole: Role = null;
    let userPrivileges: Privilege[] = [];
    if (user) userRole = user.role;
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
