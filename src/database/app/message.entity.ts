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
  ManyToMany,
} from 'typeorm';
import { GenericEntity } from '../core/generic.entity';
import { User } from '../core/user.entity';
import { MessageCategory } from './message.category.entity';

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
 * Message table. Make sure this is added to index.ts
 */
@Entity()
export class Message extends GenericEntity {
  @Column({ length: 200 })
  message: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //MessageCategory
  @ManyToMany(
    type => MessageCategory,
    messageCategory => messageCategory.messages,
  )
  categories: MessageCategory[];

  //User
  @ManyToOne(type => User, user => user.messages)
  user: User;
}
