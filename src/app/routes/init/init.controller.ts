/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Controller, Post } from '@nestjs/common';

//------------------------------------------------
//--------------------- CLASS --------------------
//------------------------------------------------

//-----------POST----------\\

//Input
export class PostInput {}

//Output
export class PostOutput {
  status: string;
}

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@Controller('init')
export class InitController {
  constructor(
  ) {}

  @Post()
  async Post(): Promise<PostOutput> {
    

    return {
      status: "server was initialized.",
    };
  }
}
