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
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Privilege } from './privilege.entity';
import { User } from './user.entity';
import { GenericEntity } from './generic.entity';

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
 * Session table. Make sure this is added to index.ts
 */
@Entity()
export class Session extends GenericEntity {
  @Column('datetime') //For dates, you must use the 'timestamp' specifier UNLESS you are using @CreateDateColumn() or @UpdateDateColumn
  lastUsed: Date;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //User
  @ManyToOne(type => User, user => user.sessions)
  user: User;
}
