/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  AuthController,
  GenericController,
  InjectRepo,
  PrivilegeHas,
  CoreRequest,
  promiseArray,
  PatchRelationApply,
  SyncListOutput,
  SyncDataOutput,
  GenericGetMode,
  SyncHash,
  ConfigService,
} from 'core';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Get, Body, Post, Patch, Request, Delete } from '@nestjs/common';
import {
  GetInput,
  GetOutput,
  PatchInput,
  PostInput,
  PostOutput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
} from './${entity.filename}.class';
import { ${entity.upper}, ${entity.upper}Token } from 'database';
import { ${entity.upper}Service } from './${entity.filename}.service';
/// < entity.imports.template >

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('${controllerPath}') /* http://localhost:3000/authenticated/${controllerPath} */
export class ${entity.upper}Controller extends GenericController<${entity.upper}> {
  constructor(
    configService: ConfigService,
    @InjectRepo(${entity.upper}Token)
    private readonly ${entity.lower}Repository: Repository<${entity.upper}>,
    private readonly ${entity.lower}Service: ${entity.upper}Service,
  ) {
    super(configService);
  }

  /**
   * Get() - ${entity.upper} -> queries the ${entity.lower} table
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Get()
  @PrivilegeHas(`${entity.dot}.get`)
  async Get(@Body() input: GetInput, @Request() req: CoreRequest): Promise<SyncListOutput | SyncDataOutput> {
    //This class inherits GenericController. We call handleGet() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleGet(input);
  }

  /**
   * handleList - ${entity.upper} -> return array of hashes for the result set.
   * @param input parameters for the request
   */
  async handleList(input:GetInput) {
    let query = this.${entity.lower}Service
        .createQueryBuilder()
        .select(this.${entity.lower}Service.transformColumns(['id', 'updatedAt']));
    
    /**
     * Apply Conditions to the query
     */
    switch (input.mode) {
      case GenericGetMode.All:
        //GenericGetMode.All -> get all rows, apply no condition
        break;
      case GenericGetMode.Discrete:
        //GenericGetMode.Discrete -> get only specific ids
        query = query.whereInIds(input.ids);
        break;
      case GenericGetMode.ParameterSearch:
        //GenericGetMode.ParameterSearch -> get rows which match the search parameters
        query = query.where(input.parameterSearch);
        break;
    }

    /**
     * Apply Pagination to the query
     * in some cases where the dataset is so large, you may want to deny access to the service
     * unless pagination parameters are provided.
     */
    if(!!input.page) {
      query = this.${entity.lower}Service.applyPagination(
        query, 
        input.page, 
        input.pageSize
      );
    }

    //Perform the query, get the result set.
    let rows = await query.getMany();

    //Convert the result set to hashes and return the hashes
    let result = rows.map(v => new SyncHash(v.id, v.updatedAt));
    return result;
  }

  /**
   * handleData - returns the objects which the client needs to download for the first time or redownload
   * @param ids the ids of objects which the client needs to download
   */
  async handleData(ids:number[]) : Promise<Partial<GetOutput>[]> {
    let query:SelectQueryBuilder<${entity.upper}>;
    query = this.${entity.lower}Service.createQueryBuilder();
    //query = query.select(this.${entity.lower}Service.transformColumns(['mycolumn1', 'mycolumn2'])); //Override which columns of the table are returned here, otherwise all are returned.
    /// < entity.controller.get.stems.template >
    query = query.whereInIds(ids);
    return await query.getMany();
  }

  /**
   * Post() - ${entity.upper} -> creates new ${entity.lowerPlural}
   * 1) convert - convert entries to entities that contain all the data they require
   * 2) save - save the entities in the database.
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  @PrivilegeHas(`${entity.dot}.post`)
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    //1) Prepare to create new rows in specified table by converting entries => entities
    let entities = input.entries.map(v => {
        let o: ${entity.upper} = this.${entity.lower}Repository.create();

        /// < entity.controller.post.field.template >

        /// < entity.controller.post.relation.template >
        return o;
      });

    //2) Save all rows
    await this.${entity.lower}Repository.save(entities);

    //3) Ping stems
    /// < entity.controller.ping.template >

    //Return result
    return { result: entities.map(v => v.id) };
  }

  /**
   * Patch() - ${entity.upper} -> updates ${entity.lowerPlural}
   * 1) convert - convert entries to entities with only their id, for phase 2
   * 2) find - find the entites
   * 3) apply - apply the changes from the entries to the entites
   * 4) save - save the entities
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Patch()
  @PrivilegeHas(`${entity.dot}.patch`)
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    //1) Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <${entity.upper}>{ id: v.id });

    //2) For each entry, find the row it pertains to.
    let toApply: ${entity.upper}[] = await promiseArray(
      toFind.map(v => {
        return this.${entity.lower}Service.findById(v.id, query => {
          /// < entity.controller.get.stems.template >
          return query;
        })
      }),
    );

    //3) For each entry, apply the update from the input parameters
    let toSave = toApply.map((v, i) => {
      //duplicate the input value v to o. o stands for output
      let o = this.${entity.lower}Repository.create(v);

      /// < entity.controller.patch.field.template >

      /// < entity.controller.patch.relation.template >

      return o;
    });

    //4) Save all entries at once - all effects from above routine are saved in this line
    await this.${entity.lower}Repository.save(toSave);

    //5) Ping stems
    /// < entity.controller.ping.template >

    //Return result
    return { result: toSave.map(v => v.id) };
  }

  /**
   * Delete() - ${entity.upper} -> deletes ${entity.lowerPlural}
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Delete()
  @PrivilegeHas(`${entity.dot}.delete`)
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    //Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <${entity.upper}>{ id: v.id });

    //For each entry, find the row it pertains to.
    let toDelete: ${entity.upper}[] = await promiseArray(
      toFind.map(v => this.${entity.lower}Repository.findOne(v)),
    );

    //All entries found... convert to an easier format for deletion
    let deleteIDs = toDelete.map(v => v.id);

    //Delete all entries at once
    await this.${entity.lower}Repository.delete(deleteIDs);

    //Return result
    return { result: deleteIDs };
  }
}
