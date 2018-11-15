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
    

    return true;
  }
}