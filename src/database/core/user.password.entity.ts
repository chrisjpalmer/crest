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
} from 'typeorm';
import { User } from './user.entity';

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
 * UserPassword table. Make sure this is added to index.ts
 */
@Entity()
export class UserPassword {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 400 })
  hash: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //Role
  @OneToOne(type => User, user => user.userPassword)
  user: User;
}
