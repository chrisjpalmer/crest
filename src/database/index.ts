/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
export * from './core/generic.entity';

import { Privilege } from './core/privilege.entity';
import { Role } from './core/role.entity';
import { Session } from './core/session.entity';
import { User } from './core/user.entity';
import { UserPassword } from './core/user.password.entity';
import { RequestLog } from './core/request.log.entity';
import { Message } from './app/message.entity';
import { MessageCategory } from './app/message.category.entity';
/// < import entity >

export * from './core/privilege.entity';
export * from './core/role.entity';
export * from './core/session.entity';
export * from './core/user.entity';
export * from './core/user.password.entity';
export * from './core/request.log.entity';
export * from './app/message.entity';
export * from './app/message.category.entity';
/// < export entity >

/**
 * Whenever you create a new database entity, ensure that you follow the pattern below.
 * This allows the new entity to be exported correctly into the parent module which uses this
 */
export const PrivilegeToken = 'Privilege';
export const RoleToken = 'Role';
export const SessionToken = 'Session';
export const UserToken = 'User';
export const UserPasswordToken = 'UserPassword';
export const RequestLogToken = 'RequestLog';
export const MessageToken = 'Message';
export const MessageCategoryToken = 'MessageCategory';
/// < export entity.token >

/**
 * Whenever you create a new database entity, add the entity along with its token
 * to this array
 */
export const Entities: { token: string; type: any }[] = [
  { token: PrivilegeToken, type: Privilege },
  { token: RoleToken, type: Role },
  { token: SessionToken, type: Session },
  { token: UserToken, type: User },
  { token: UserPasswordToken, type: UserPassword },
  { token: RequestLogToken, type: RequestLog },
  { token: MessageToken, type: Message },
  { token: MessageCategoryToken, type: MessageCategory },
  /// < export entity.object >
];
