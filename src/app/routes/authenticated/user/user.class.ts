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
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

//------------------------------------------------
//--------------------- CLASS --------------------
//------------------------------------------------


//-----------Get-----------\\

//Input
export class GetInput {
  @IsNumber()
  @Min(0)
  page:number;

  @IsNumber()
  @Min(0)
  @Max(100)
  pageSize:number;
}

//Output
export interface GetOutput {
  totalEntries:number;
  totalPages:number;
  users:GetEntryOutput[];
}

export interface GetEntryOutput {
  username:string;
  firstName:string;
  lastName:string;
}

//-----------Post----------\\

//Input
export class PostInput {}

//Output
export class PostOutput {}

//-----------Patch----------\\

//Input
export class PatchInput {}

//Output
export class PatchOutput {}

//-----------Delete----------\\

//Input
export class DeleteInput {}

//Output
export class DeleteOutput {}
