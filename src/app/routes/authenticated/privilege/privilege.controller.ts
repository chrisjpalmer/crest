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
  PatchInput,
  PostInput,
  PostOutput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
} from './privilege.input';
import { Privilege, PrivilegeToken } from 'database';
import { PrivilegeService } from 'core';
import { Role } from 'database';

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('privilege') /* http://localhost:3000/authenticated/privilege */
export class PrivilegeController extends GenericController<Privilege> {
  constructor(
    configService: ConfigService,
    @InjectRepo(PrivilegeToken)
    private readonly privilegeRepository: Repository<Privilege>,
    private readonly privilegeService: PrivilegeService,
  ) {
    super(configService);
  }

  /**
   * Get() - Privilege -> queries the privilege table
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Get()
  @PrivilegeHas(`privilege.get`)
  async Get(
    @Body() input: GetInput,
    @Request() req: CoreRequest,
  ): Promise<SyncListOutput | SyncDataOutput> {
    //This class inherits GenericController. We call handleGet() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleGet(input);
  }

  /**
   * handleList - Privilege -> return array of hashes for the result set.
   * @param input parameters for the request
   */
  async handleList(input: GetInput) {
    let query = this.privilegeService
      .createQueryBuilder()
      .select('id', 'updateAt');

    /**
     * Apply Conditions to the query
     */
    switch (input.mode) {
      case GenericGetMode.All:
        //GenericGetMode.All -> get all rows, apply no condition
        break;
      case GenericGetMode.Discrete:
        //GenericGetMode.Discrete -> get only specific ids
        query = this.privilegeService.applyCondition(query, input.ids);
        break;
      case GenericGetMode.ParameterSearch:
        //GenericGetMode.ParameterSearch -> get rows which match the search parameters
        query = this.privilegeService.applyCondition(query, s => {
          return s.where(input.parameterSearch);
        });
        break;
    }

    /**
     * Apply Pagination to the query
     * in some cases where the dataset is so large, you may want to deny access to the service
     * unless pagination parameters are provided.
     */
    if (!!input.page) {
      query = this.privilegeService.applyPagination(
        query,
        input.page,
        input.pageSize,
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
  async handleData(ids: number[]): Promise<Privilege[]> {
    let query: SelectQueryBuilder<Privilege>;
    query = this.privilegeService.createQueryBuilder();
    //query = query.select('mycolumn1', 'mycolumn2'); //Override which columns of the table are returned here, otherwise all are returned.
    query = this.privilegeService.applyStems(query);
    return await query.getMany();
  }

  /**
   * Post() - Privilege -> creates new privilege(s)
   * 1) convert - convert entries to entities that contain all the data they require
   * 2) save - save the entities in the database.
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  @PrivilegeHas(`privilege.post`)
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    //1) Prepare to create new rows in specified table by converting entries => entities
    let entities = input.entries.map(v => {
      let o: Privilege = this.privilegeRepository.create();

      o.name = v.name;

      if (!!v.roles) {
        o.roles = v.roles.map(dc => <Role>{ id: dc.id });
      }

      return o;
    });

    //2) Save all rows
    await this.privilegeRepository.save(entities);

    //Return result
    return { result: entities.map(v => v.id) };
  }

  /**
   * Patch() - Privilege -> updates privilege(s)
   * 1) convert - convert entries to entities with only their id, for phase 2
   * 2) find - find the entites
   * 3) apply - apply the changes from the entries to the entites
   * 4) save - save the entities
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Patch()
  @PrivilegeHas(`privilege.patch`)
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    //1) Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <Privilege>{ id: v.id });

    //2) For each entry, find the row it pertains to.
    let toApply: Privilege[] = await promiseArray(
      toFind.map(v => this.privilegeService.findById(v.id)), //We use privilege service so that we can retrieve the subobject structure...
    );

    //3) For each entry, apply the update from the input parameters
    let toSave = toApply.map((v, i) => {
      //duplicate the input value v to o. o stands for output
      let o = this.privilegeRepository.create(v);

      //Apply update to the property
      if (!!input.entries[i].name) {
        o.name = input.entries[i].name;
      }

      //Apply update to relationship
      if (!!input.entries[i].roles) {
        o.roles = PatchRelationApply(v.id, v.roles, input.entries[i].roles);
      }

      return o;
    });

    //4) Save all entries at once - all effects from above routine are saved in this line
    await this.privilegeRepository.save(toSave);

    //Return result
    return { result: toSave.map(v => v.id) };
  }

  /**
   * Delete() - Privilege -> deletes privilege(s)
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Delete()
  @PrivilegeHas(`privilege.delete`)
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    //Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <Privilege>{ id: v.id });

    //For each entry, find the row it pertains to.
    let toDelete: Privilege[] = await promiseArray(
      toFind.map(v => this.privilegeRepository.findOne(v)),
    );

    //All entries found... convert to an easier format for deletion
    let deleteIDs = toDelete.map(v => v.id);

    //Delete all entries at once
    await this.privilegeRepository.delete(deleteIDs);

    //Return result
    return { result: deleteIDs };
  }
}
