/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  ValidateNested,
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GetRelation, PostRelation, PatchRelation, SyncInput, GenericGetMode } from 'core';

//------------------------------------------------
//--------------------- CLASS --------------------
//------------------------------------------------

//-----------Get-----------\\
export class GetInput extends SyncInput {
  //Query Mode
  mode: GenericGetMode;
  //Discrete Mode
  ids: number[];
  //ParameterSearch Mode
  parameterSearch: GetParameterSearch;

  //Pagination
  page: number;
  pageSize: number;
}

export class GetParameterSearch {
  id:number;
  updatedAt:Date;
  createdAt:Date;
  /// < entity.class.get.field.template >
}

export interface GetOutput {
  id:number;
  updatedAt:Date;
  createdAt:Date;
  /// < entity.class.get.field.template >

  //---------Relationships--------\\
  /// < entity.class.get.relation.template >
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
  /// < entity.class.post.field.template >

  //---------Relationships--------\\
  /// < entity.class.post.relation.template >
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

  /// < entity.class.patch.field.template >

  //---------Relationships--------\\
  /// < entity.class.patch.relation.template >
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
