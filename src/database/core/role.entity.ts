/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
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
 * Role table. Make sure this is added to index.ts
 */
@Entity()
export class Role extends GenericEntity {
  @Index({ unique: true })
  @Column({ length: 200 })
  name: string;

  @Column({ length: 200 })
  description: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //Privilege
  @ManyToMany(type => Privilege, privilege => privilege.roles)
  @JoinTable()
  privileges: Privilege[];

  //User
  @OneToMany(type => User, user => user.role)
  users: User[];
}
