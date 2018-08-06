/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';

export class GenericEntity {
  @PrimaryGeneratedColumn() id?: number;
  @CreateDateColumn({type:'timestamp'}) createdAt?: Date;
  @Column('timestamp', {precision:6, default: () => 'CURRENT_TIMESTAMP(6)'}) updatedAt?: Date;
}
