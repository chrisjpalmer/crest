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
  Index,
  JoinTable,
} from 'typeorm';
import { GenericEntity } from '../core/generic.entity';
import { Genre } from './genre.entity';

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
 * Book table. If you added without 'up', make sure this is added to index.ts
 */
@Entity()
export class Book extends GenericEntity {
  @Index({ unique: true })
  @Column({ length: 200 })
  name: string;

  @Column({ length: 200 })
  author:string;

  @Column({ length: 200 })
  blurb:string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  @ManyToMany(type => Genre, genre => genre.books)
  @JoinTable()
  genres:Genre[];
}
