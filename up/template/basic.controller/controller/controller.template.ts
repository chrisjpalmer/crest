/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  AuthController,
} from 'core';
import { Get, Body, Post, Patch, Request, Delete, Controller } from '@nestjs/common';
import {
  GetInput,
  GetOutput,
  PatchInput,
  PostInput,
  PostOutput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
} from './${api.dot}.class';


//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
///ref:{"mode":"api.authenticated", "templateFile":"common/controller.dec.template", "suffix":""} /* http://localhost:3000/${controllerPath} */
export class ${api.upper}Controller {
  constructor(
  
  ) {}

  /**
   * Get() - ${api.upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Get()
  @PrivilegeHas(`${api.dot}.get`)
  async Get(
    @Body() input: GetInput,
    @Request() req: CoreRequest,
  ): Promise<GetOutput> {
    
  }

  /**
   * Post() - ${api.upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  @PrivilegeHas(`${api.dot}.post`)
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    
  }

  /**
   * Patch() - ${api.upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Patch()
  @PrivilegeHas(`${api.dot}.patch`)
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    
  }

  /**
   * Delete() - ${api.upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Delete()
  @PrivilegeHas(`${api.dot}.delete`)
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    
  }
}
