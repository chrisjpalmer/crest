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
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GetRelation,
  PostRelation,
  PatchRelation,
  SyncInput,
  GenericGetMode,
} from 'core';

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
  id: number;
  updatedAt: Date;
  createdAt: Date;
  name: string;
}

export interface GetOutput {
  id: number;
  updatedAt: Date;
  createdAt: Date;
  name: string;

  //---------Relationships--------\\
  roles: Partial<GetRelation>[];
}

//-----------Post----------\\

//Input
export class PostInput {
  @ValidateNested()
  @Type(() => PostInputPrivilege)
  @IsArray()
  entries: PostInputPrivilege[];
}

export class PostInputPrivilege {
  @IsString() name: string;

  //---------Relationships--------\\
  @ValidateNested()
  @Type(() => PostRelation)
  @IsArray()
  @IsOptional()
  roles: PostRelation[];
}

//Output
export class PostOutput {
  result: number[];
}

//-----------Patch----------\\

//Input
export class PatchInput {
  @ValidateNested()
  @Type(() => PatchInputPrivilege)
  @IsArray()
  entries: PatchInputPrivilege[];
}

export class PatchInputPrivilege {
  @IsNumber() id: number;

  @IsString()
  @IsOptional()
  name: string;

  //---------Relationships--------\\
  @ValidateNested()
  @Type(() => PostRelation)
  @IsArray()
  @IsOptional()
  roles: PatchRelation[];
}

//Output
export class PatchOutput {
  result: number[];
}

//-----------Delete----------\\

//Input
export class DeleteInput {
  @ValidateNested()
  @Type(() => DeleteInputPrivilege)
  @IsArray()
  entries: DeleteInputPrivilege[];
}

export class DeleteInputPrivilege {
  @IsNumber() id: number;
}

//Output
export class DeleteOutput {
  result: number[];
}
