/** BOILERPLATE - don't touch unless you are brave */
import { Controller } from '@nestjs/common';
import { UserServiceOutput } from '../entity.service';


export const AuthPrefix = 'authenticated';
export const AuthController = (prefix?: string) =>
  Controller(`${AuthPrefix}/${prefix}`);
export const AuthRoutes = `/${AuthPrefix}/**/`;

export interface AuthUserServiceOutput {
  userData:UserServiceOutput;
  sessionId:number;
}
