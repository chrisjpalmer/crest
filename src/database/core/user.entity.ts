/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Session } from './session.entity';
import { UserPassword } from './user.password.entity';
import { GenericEntity } from './generic.entity';
import { RequestLog } from '../core/request.log.entity';

/**
 * ManyToOne:                  target:Target
 * OneToMany:                  target:Target[]
 *
 * ManyToMany (parent):        JoinTable + target:Target[]
 * ManyToMany:                 target:Target[]
 *
 * OneToOne:                   target:Target
 * OneToOne (parent):          JoinColumn + target:Target
 */

/**
 * User table. Make sure this is added to index.ts
 */
@Entity()
export class User extends GenericEntity {
  @Index({ unique: true })
  @Column({ length: 200 })
  username?: string;

  @Column({ length: 200, default: null })
  firstName?: string;

  @Column({ length: 200, default: null })
  lastName?: string;

  @Column({ length: 200, default: null })
  emailAddress?: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //Role
  @ManyToOne(type => Role, role => role.users)
  role?: Role;

  //Session
  @OneToMany(type => Session, session => session.user)
  sessions?: Session[];

  //UserPassword
  @OneToOne(type => UserPassword, userPassword => userPassword.user)
  @JoinColumn()
  userPassword?: UserPassword;

  //RequestLogs
  @OneToMany(type => RequestLog, requestLog => requestLog.user)
  requestLogs?: RequestLog[];
}
