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
import { PostRelation, PatchRelation, SyncInput, GenericGetMode } from 'core';

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

  description: string;
}

//-----------Post----------\\

//Input
export class PostInput {
  @ValidateNested()
  @Type(() => PostInputRole)
  @IsArray()
  entries: PostInputRole[];
}

export class PostInputRole {
  @IsString() name: string;

  @IsString() description: string;

  //---------Relationships--------\\
  @ValidateNested()
  @Type(() => PostRelation)
  @IsArray()
  @IsOptional()
  privileges: PostRelation[];
}

//Output
export class PostOutput {
  result: number[];
}

//-----------Patch----------\\

//Input
export class PatchInput {
  @ValidateNested()
  @Type(() => PatchInputRole)
  @IsArray()
  entries: PatchInputRole[];
}

export class PatchInputRole {
  @IsNumber() id: number;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  //---------Relationships--------\\
  @ValidateNested()
  @Type(() => PostRelation)
  @IsArray()
  @IsOptional()
  privileges: PatchRelation[];
}

//Output
export class PatchOutput {
  result: number[];
}

//-----------Delete----------\\

//Input
export class DeleteInput {
  @ValidateNested()
  @Type(() => DeleteInputRole)
  @IsArray()
  entries: DeleteInputRole[];
}

export class DeleteInputRole {
  @IsNumber() id: number;
}

//Output
export class DeleteOutput {
  result: number[];
}
