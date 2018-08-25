/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  AuthController,
  SyncController,
  InjectRepo,
  PrivilegeHas,
  CoreRequest,
  awaitPromiseArrayThrowAny,
  PatchRelationApply,
  SyncListOutput,
  SyncDataOutput,
  GenericSyncMode,
  SyncHash,
  ConfigService,
} from 'core';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Get, Body, Post, Patch, Request, Delete } from '@nestjs/common';
import {
  SyncInput,
  SyncOutput,
  PatchInput,
  PostInput,
  PostOutput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
} from './role.class';
import { Role, RoleToken } from 'database';
import { RoleService } from 'core';
import { Privilege, User } from 'database';

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('role/sync') /* http://localhost:3000/authenticated/role/sync */
export class RoleSyncController extends SyncController<Role> {
  constructor(
    configService: ConfigService,
    @InjectRepo(RoleToken) private readonly roleRepository: Repository<Role>,
    private readonly roleService: RoleService,
  ) {
    super(configService);
  }

  /**
   * Post() - Role -> queries the role table
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  @PrivilegeHas(`role.sync`)
  async Sync(
    @Body() input: SyncInput,
    @Request() req: CoreRequest,
  ): Promise<SyncListOutput | SyncDataOutput> {
    //This class inherits SyncController. We call handleSync() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleSync(input, req);
  }

  /**
   * handleList - Role -> return array of hashes for the result set.
   * @param input parameters for the request
   */
  async handleList(input: SyncInput, req: CoreRequest) {
    let query = this.roleService
      .createQueryBuilder()
      .select(this.roleService.transformColumns(['id', 'updatedAt']));

    /**
     * Apply Conditions to the query
     */
    switch (input.mode) {
      case GenericSyncMode.All:
        //GenericSyncMode.All -> get all rows, apply no condition
        break;
      case GenericSyncMode.Discrete:
        //GenericSyncMode.Discrete -> get only specific ids
        query = query.whereInIds(input.ids);
        break;
      case GenericSyncMode.ParameterSearch:
        //GenericSyncMode.ParameterSearch -> get rows which match the search parameters
        query = query.where(input.parameterSearch);
        break;
    }

    /**
     * Apply Pagination to the query
     * in some cases where the dataset is so large, you may want to deny access to the service
     * unless pagination parameters are provided.
     */
    if (typeof input.page === 'number') {
      query = this.roleService.applyPagination(
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
  async handleData(ids: number[], req: CoreRequest): Promise<Partial<SyncOutput>[]> {
    let query: SelectQueryBuilder<Role>;
    query = this.roleService.createQueryBuilder();
    //query = query.select(this.roleService.transformColumns(['mycolumn1', 'mycolumn2'])); //Override which columns of the table are returned here, otherwise all are returned.
    query = this.roleService.applyStemsPrivileges(query); //Comment out at your leisure.
    //query = this.roleService.applyStemsUsers(query); //Comment out at your leisure.

    query = query.whereInIds(ids);

    let result = await query.getMany();
    let output = result.map((entry):Partial<SyncOutput> => {
      let outputEntry:Partial<SyncOutput> = {
        id: entry.id,
        updatedAt: entry.updatedAt.toISOString(),
        createdAt: entry.createdAt.toISOString(),

        name: entry.name,
        description: entry.description,
        
        privileges: entry.privileges,
      };
      return outputEntry;
    });

    return output;
  }
}

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('role') /* http://localhost:3000/authenticated/role */
export class RoleController {
  constructor(
    configService: ConfigService,
    @InjectRepo(RoleToken) private readonly roleRepository: Repository<Role>,
    private readonly roleService: RoleService,
  ) {}
  /**
   * Post() - Role -> creates new role(s)
   * 1) convert - convert entries to entities that contain all the data they require
   * 2) save - save the entities in the database.
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  @PrivilegeHas(`role.post`)
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    //1) Prepare to create new rows in specified table by converting entries => entities
    let entities = input.entries.map(v => {
      let o: Role = this.roleRepository.create();

      o.name = v.name;

      o.description = v.description;

      if (!!v.privileges) {
        o.privileges = v.privileges.map(dc => <Privilege>{ id: dc.id });
      }

      //if (!!v.users) {
      //  o.users = v.users.map(dc => <User>{ id: dc.id });
      //}

      return o;
    });

    //2) Save all rows
    await this.roleRepository.save(entities);

    //3) Ping stems
    await this.roleService.pingStemsPrivileges(input.entries); //Comment out at your leisure.
    //await this.roleService.pingStemsUsers(input.entries); //Comment out at your leisure.

    //Return result
    return { result: entities.map(v => v.id) };
  }

  /**
   * Patch() - Role -> updates role(s)
   * 1) convert - convert entries to entities with only their id, for phase 2
   * 2) find - find the entites
   * 3) apply - apply the changes from the entries to the entites
   * 4) save - save the entities
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Patch()
  @PrivilegeHas(`role.patch`)
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    //1) Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <Role>{ id: v.id });

    //2) For each entry, find the row it pertains to.
    let toApply: Role[] = await awaitPromiseArrayThrowAny(
      toFind.map(v => {
        return this.roleService.findById(v.id, query => {
          query = this.roleService.applyStemsPrivileges(query); //Comment out at your leisure.
          //query = this.roleService.applyStemsUsers(query); //Comment out at your leisure.
          return query;
        });
      }),
    );

    //3) For each entry, apply the update from the input parameters
    let toSave = toApply.map((v, i) => {
      //duplicate the input value v to o. o stands for output
      let o = this.roleRepository.create(v);

      //Update the updatedAt column of the entry
      o.updatedAt = <any> (() => 'CURRENT_TIMESTAMP(6)');

      //Apply update to the property
      if (!!input.entries[i].name) {
        o.name = input.entries[i].name;
      }
      //Apply update to the property
      if (!!input.entries[i].description) {
        o.description = input.entries[i].description;
      }

      //Apply update to relationship
      if (!!input.entries[i].privileges) {
        o.privileges = PatchRelationApply(
          v.id,
          v.privileges,
          input.entries[i].privileges,
        );
      }
      //Apply update to relationship
      //if (!!input.entries[i].users) {
      //  o.users = PatchRelationApply(v.id, v.users, input.entries[i].users);
      //}

      return o;
    });

    //4) Save all entries at once - all effects from above routine are saved in this line
    await this.roleRepository.save(toSave);

    //5) Ping stems
    await this.roleService.pingStemsPrivileges(input.entries); //Comment out at your leisure.
    //await this.roleService.pingStemsUsers(input.entries); //Comment out at your leisure.

    //Return result
    return { result: toSave.map(v => v.id) };
  }

  /**
   * Delete() - Role -> deletes role(s)
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Delete()
  @PrivilegeHas(`role.delete`)
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    //1) Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <Role>{ id: v.id });

    //2) For each entry, find the row it pertains to.
    let toDelete: Role[] = await awaitPromiseArrayThrowAny(
      toFind.map(v => {
        return this.roleService.findById(v.id, query => {
          query = this.roleService.applyStemsPrivileges(query); //Comment out at your leisure.
          return query;
        });
      }),
    );

    //3) All entries found... convert to an easier format for deletion
    let deleteIDs = toDelete.map(v => v.id);

    //4) Delete all entries at once
    await this.roleRepository.delete(deleteIDs);

    //5) Ping stems
    await this.roleService.pingStemsPrivileges(toDelete); //Comment out at your leisure.

    //Return result
    return { result: deleteIDs };
  }
}
