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
  SyncRelation,
  PostRelation,
  PatchRelation,
  PatchRelationSingle,
  GenericSyncInput,
  GenericSyncMode,
} from 'core';

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
  id?: number;
  updatedAt?: Date;
  createdAt?: Date;
  name?: string;
}

export interface SyncOutput {
  id: number;
  updatedAt: Date;
  createdAt: Date;
  name: string;

  //---------Relationships--------\\
  roles: Partial<SyncRelation>[];
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
  @Type(() => PatchRelation)
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
