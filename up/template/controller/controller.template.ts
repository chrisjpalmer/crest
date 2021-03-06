/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { AuthController, PrivilegeHas, CoreRequest } from 'core';
import { Get, Body, Post, Patch, Request, Delete, Controller, Query } from '@nestjs/common';
import {
  GetInput,
  GetOutput,
  PatchInput,
  PostInput,
  PostOutput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
} from './${dot}.class';
import { transformAndValidate } from "class-transformer-validator";

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
///ref:{"mode":"controller.decorator", "params" : { "suffix":"" } }
export class ${upper}Controller {
  constructor(
  
  ) {}

  /**
   * Get() - ${upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Get()
  ///ref:{"mode":"controller.privilege", "params" : { "suffix":".get" } }
  async Get(
    @Query('input') _input: string,
    @Request() req: CoreRequest,
  ): Promise<GetOutput> {
    let input:GetInput = JSON.parse(_input);
    input = await transformAndValidate(GetInput, input);
    return null;
  }

  /**
   * Post() - ${upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  ///ref:{"mode":"controller.privilege", "params" : { "suffix":".post" }}
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    return null;
  }

  /**
   * Patch() - ${upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Patch()
  ///ref:{"mode":"controller.privilege", "params" : { "suffix":".patch" }}
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    return null;
  }

  /**
   * Delete() - ${upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Delete()
  ///ref:{"mode":"controller.privilege", "params" : { "suffix":".delete" }}
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    return null;
  }
}
