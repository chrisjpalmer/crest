/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { AuthController, PrivilegeHas, CoreRequest, SyncController, ConfigService, SyncListOutput, SyncDataOutput, SyncHash } from 'core';
import { Get, Body, Post, Patch, Request, Delete, Controller, Query } from '@nestjs/common';
import {
  SyncInput,
  SyncEntryOutput,
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
///ref:{"mode":"controller.decorator", "params": { "suffix":"/sync" } }
export class ${upper}SyncController extends SyncController<number> {
  constructor(
    configService: ConfigService,
  ) {
    super(configService);
  }

  /**
   * Sync() - ${upper}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  ///ref:{"mode":"controller.privilege", "params" : { "suffix":".sync" } }
  async Sync(
    @Body() input: SyncInput,
    @Request() req: CoreRequest,
  ): Promise<SyncListOutput<number> | SyncDataOutput> {
    //This class inherits SyncController. We call handleSync() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleSync(input, req);
  }

  /**
   * handleList - User -> return array of hashes for the result set.
   * @param input parameters for the request
   */
  async handleList(input: SyncInput, req: CoreRequest) {
    let rows:{id:any, updatedAt:Date}[];

    //Convert the result set to hashes and return the hashes
    let result = rows.map(v => new SyncHash(v.id, v.updatedAt));
    return result;
  }

  /**
   * handleData - returns the objects which the client needs to download for the first time or redownload
   * @param ids the ids of objects which the client needs to download
   */
  async handleData(ids: number[], req: CoreRequest): Promise<Partial<SyncEntryOutput>[]> {
    let output: SyncEntryOutput[] = ids.map(id => { return {} });
    return output;
  }
}

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
