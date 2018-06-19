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
  PatchRelationSingle,
  SyncInput,
  GenericGetMode,
} from 'core';

//------------------------------------------------
//--------------------- CLASS --------------------
//------------------------------------------------

//-----------Get-----------\\
export class GetInput extends SyncInput {
  //Query Mode
  @IsOptional() mode: GenericGetMode;
  //Discrete Mode
  @IsOptional() ids: number[];
  //ParameterSearch Mode
  @IsOptional() parameterSearch: GetParameterSearch;

  //Pagination
  @IsOptional() page: number;
  @IsOptional() pageSize: number;
}

export class GetParameterSearch {
  @IsOptional() id: number;
  @IsOptional() updatedAt: Date;
  @IsOptional() createdAt: Date;
  @IsOptional() username: string;
  @IsOptional() firstName: string;
  @IsOptional() lastName: string;
  @IsOptional() emailAddress: string;
}

export interface GetOutput {
  id: number;
  updatedAt: Date;
  createdAt: Date;
  username: string;

  firstName: string;

  lastName: string;

  emailAddress: string;

  //---------Relationships--------\\
  role: Partial<GetRelation>;
}

//-----------Post----------\\

//Input
export class PostInput {
  @ValidateNested()
  @Type(() => PostInputUser)
  @IsArray()
  entries: PostInputUser[];
}

export class PostInputUser {
  @IsString() username: string;

  @IsString() password: string;

  @IsString() firstName: string;

  @IsString() lastName: string;

  @IsString() emailAddress: string;

  //---------Relationships--------\\
  @ValidateNested()
  @Type(() => PostRelation)
  @IsOptional()
  role: PostRelation;
}

//Output
export class PostOutput {
  result: number[];
}

//-----------Patch----------\\

//Input
export class PatchInput {
  @ValidateNested()
  @Type(() => PatchInputUser)
  @IsArray()
  entries: PatchInputUser[];
}

export class PatchInputUser {
  @IsNumber() id: number;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  emailAddress: string;

  //---------Relationships--------\\
  @ValidateNested()
  @Type(() => PostRelation)
  @IsOptional()
  role: PatchRelation;
}

//Output
export class PatchOutput {
  result: number[];
}

//-----------Delete----------\\

//Input
export class DeleteInput {
  @ValidateNested()
  @Type(() => DeleteInputUser)
  @IsArray()
  entries: DeleteInputUser[];
}

export class DeleteInputUser {
  @IsNumber() id: number;
}

//Output
export class DeleteOutput {
  result: number[];
}
