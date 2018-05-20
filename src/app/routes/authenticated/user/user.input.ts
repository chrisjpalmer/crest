/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

//------------------------------------------------
//--------------------- INPUT --------------------
//------------------------------------------------

//-----------GET-----------\\
//Uses GenericGetController

//-----------POST----------\\

//Input
export class PostInput {
  @ValidateNested()
  @Type(() => PostInputUser)
  entries: PostInputUser[];
}

export class PostInputUser {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
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
  entries: PatchInputUser[];
}

export class PatchInputUser {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
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
  entries: DeleteInputUser[];
}

export class DeleteInputUser {
  id: number;
}

//Output
export class DeleteOutput {
  result: number[];
}
