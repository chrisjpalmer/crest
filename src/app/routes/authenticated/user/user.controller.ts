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
  awaitPromiseArray,
  PatchRelationApply,
  SyncListOutput,
  SyncDataOutput,
  GenericSyncMode,
  SyncHash,
  ConfigService,
  UserServiceOutput,
  UserServiceInputFull,
} from 'core';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Get, Body, Post, Patch, Request, Delete } from '@nestjs/common';
import {
  SyncInput,
  SyncEntryOutput,
  PatchInput,
  PostInput,
  PostOutput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
  PostOutputResult,
  PatchOutputResult,
  DeleteOutputResult,
} from './user.class';
import { User, UserToken } from 'database';
import { UserService } from 'core';
import { Role } from 'database';

class UserPwdWrapper {
  user: User;
  password: string;
}

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('user/sync') /* http://localhost:3000/authenticated/user/sync */
export class UserSyncController extends SyncController<number> {
  constructor(
    configService: ConfigService,
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {
    super(configService);
  }

  /**
   * Post() - User -> queries the user table
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  @PrivilegeHas(`user.sync`)
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
    let query = this.userService
      .createQueryBuilder()
      .select(this.userService.transformColumns(['id', 'updatedAt']));

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
      query = this.userService.applyPagination(
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
  async handleData(ids: number[], req: CoreRequest): Promise<Partial<SyncEntryOutput>[]> {

    let results: UserServiceOutput[] = [];
    for (let i = 0; i < ids.length; i++) {
      let result = await this.userService.getUserData(ids[i]);
      results.push(result);
    }

    let output = results.map((entry): Partial<SyncEntryOutput> => {
      let outputEntry: Partial<SyncEntryOutput> = {
        id: entry.id,
        updatedAt: entry.updatedAt.toISOString(),
        createdAt: entry.createdAt.toISOString(),

        username: entry.username,
        firstName: entry.firstName,
        lastName: entry.lastName,
        emailAddress: entry.emailAddress,

        role: { id: entry.roleId },
      };
      return outputEntry;
    });

    return output;
  }
}

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('user') /* http://localhost:3000/authenticated/user */
export class UserController {
  constructor(
    configService: ConfigService,
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) { }
  /**
   * Post() - User -> creates new user(s)
   * 1) convert - convert entries to entities that contain all the data they require
   * 2) convert to an object which contains the user and the user password, in prep to call the service create method
   * 3) create - create all users
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  @PrivilegeHas(`user.post`)
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {

    //1) Prepare to create new users by converting entries => entities
    let createOperations: Promise<number>[] = [];
    for (let i = 0; i < input.entries.length; i++) {
      let userToCreate = input.entries[i];
      let result: Promise<number>;
      if (!!userToCreate.role) {
        result = this.userService.createUserFull({
          username: userToCreate.username,
          firstName: userToCreate.firstName,
          lastName: userToCreate.lastName,
          emailAddress: userToCreate.emailAddress,
          password: userToCreate.password,
          roleId: userToCreate.role.id,
        });
      } else {
        result = this.userService.createUserNoRelations({
          username: userToCreate.username,
          firstName: userToCreate.firstName,
          lastName: userToCreate.lastName,
          emailAddress: userToCreate.emailAddress,
          password: userToCreate.password,
        });
      }
      createOperations.push(result);
    }

    let results = await awaitPromiseArray(createOperations);

    let mappedResults: PostOutputResult[] = results.map((r, i) => {
      let username = input.entries[i].username;
      let id = r.value || null;
      if (!!r.error) {
        return {
          username,
          id,
          success: true
        }
      }

      return {
        username,
        id,
        success: false,
        error: r.error.toString()
      }
    })

    //Return result
    return { result: mappedResults };
  }

  /**
   * Patch() - User -> updates user(s)
   * 1) convert - convert entries to entities that contain all the data they require
   * 2) convert to an object which contains the user and the user password, in prep to call the service update method
   * 3) update - update all users
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Patch()
  @PrivilegeHas(`user.patch`)
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    //1) Prepare to create new users by converting entries => entities
    let updateOperations: Promise<number>[] = [];
    for (let i = 0; i < input.entries.length; i++) {
      let userToUpdate = input.entries[i];
      let result: Promise<number>;
      let userServiceInput: Partial<UserServiceInputFull> = {};
      if (!!userToUpdate.username) {
        userServiceInput.username = userToUpdate.username;
      }
      if (!!userToUpdate.firstName) {
        userServiceInput.firstName = userToUpdate.firstName;
      }
      if (!!userToUpdate.lastName) {
        userServiceInput.lastName = userToUpdate.lastName;
      }
      if (!!userToUpdate.emailAddress) {
        userServiceInput.emailAddress = userToUpdate.emailAddress;
      }
      if (!!userToUpdate.password) {
        userServiceInput.password = userToUpdate.password;
      }
      if (!!userToUpdate.role) {
        userServiceInput.roleId = userToUpdate.role.id;
      }

      result = this.userService.updateUser(input.entries[i].id, userToUpdate);
      updateOperations.push(result);
    }

    let results = await awaitPromiseArray(updateOperations);

    let mappedResults: PatchOutputResult[] = results.map((r, i) => {
      let id = r.value;
      if (!!r.error) {
        return {
          id,
          success: true
        }
      }

      return {
        id,
        success: false,
        error: r.error.toString()
      }
    });

    //Return result
    return { result: mappedResults };
  }

  /**
   * Delete() - User -> deletes user(s)
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Delete()
  @PrivilegeHas(`user.delete`)
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    let deleteOperations: Promise<number>[] = [];
    for (let i = 0; i < input.entries.length; i++) {
      let userToDelete = input.entries[i];
      let result: Promise<number>;

      result = this.userService.deleteUser(userToDelete.id);
      deleteOperations.push(result)
    }

    let results = await awaitPromiseArray(deleteOperations);

    let mappedResults: DeleteOutputResult[] = results.map((r, i) => {
      let id = r.value;
      if (!!r.error) {
        return {
          id,
          success: true
        }
      }

      return {
        id,
        success: false,
        error: r.error.toString()
      }
    });

    //Return result
    return { result: mappedResults };
  }
}
