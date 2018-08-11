/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  ValidateNested,
  IsArray,
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  IsDate
} from 'class-validator';
import { Type } from 'class-transformer';
import { SyncRelation, PostRelation, PatchRelation, PatchRelationSingle, GenericSyncInput, GenericSyncMode } from 'core';

//------------------------------------------------
//--------------------- CLASS --------------------
//------------------------------------------------

//-----------Sync-----------\\
export class SyncInput extends GenericSyncInput {
  //Query Mode
  @IsOptional() mode: GenericSyncMode;
  //Discrete Mode
  @IsOptional() ids: number[];
  //ParameterSearch Mode
  @IsOptional() parameterSearch: SyncParameterSearch;

  //Pagination
  @IsOptional() page: number;
  @IsOptional() pageSize: number;
}

export interface SyncParameterSearch {
  id?:number;
  updatedAt?:Date;
  createdAt?:Date;
  ///ref:{"mode":"childField.normal", "templateFile":"entity.controller/class/sync/parameter.field.template"}
}

export interface SyncOutput {
  id:number;
  updatedAt:Date;
  createdAt:Date;
  ///ref:{"mode":"childField.normal", "templateFile":"entity.controller/class/sync/field.template"}

  //---------Relationships--------\\
  ///ref:{"mode":"childEntity.multipleSingle", "templateFile":"entity.controller/class/sync/relation.template"}
}

//-----------Post----------\\

//Input
export class PostInput {
  @ValidateNested()
  @Type(() => PostInput${entity.upper})
  @IsArray()
  entries: PostInput${entity.upper}[];
}

export class PostInput${entity.upper} {
  ///ref:{"mode":"childField.normal", "templateFile":"entity.controller/class/post/field.template"}

  //---------Relationships--------\\
  ///ref:{"mode":"childEntity.multipleSingle", "templateFile":"entity.controller/class/post/relation.template"}
}

//Output
export class PostOutput {
  result: number[];
}

//-----------Patch----------\\

//Input
export class PatchInput {
  @ValidateNested()
  @Type(() => PatchInput${entity.upper})
  @IsArray()
  entries: PatchInput${entity.upper}[];
}

export class PatchInput${entity.upper} {
  @IsNumber() id: number;

  ///ref:{"mode":"childField.normal", "templateFile":"entity.controller/class/patch/field.template"}

  //---------Relationships--------\\
  ///ref:{"mode":"childEntity.multipleSingle", "templateFile":"entity.controller/class/patch/relation.template"}
}

//Output
export class PatchOutput {
  result: number[];
}

//-----------Delete----------\\

//Input
export class DeleteInput {
  @ValidateNested()
  @Type(() => DeleteInput${entity.upper})
  @IsArray()
  entries: DeleteInput${entity.upper}[];
}

export class DeleteInput${entity.upper} {
  @IsNumber() id: number;
}

//Output
export class DeleteOutput {
  result: number[];
}
