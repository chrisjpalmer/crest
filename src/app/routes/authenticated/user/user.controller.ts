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
} from './user.class';
import { User, UserToken } from 'database';
import { UserService } from 'core';
import { Role, Session, UserPassword, Message, RequestLog } from 'database';

class UserPwdWrapper {
  user: User;
  password: string;
}

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('user') /* http://localhost:3000/authenticated/user */
export class UserController extends GenericController<User> {
  constructor(
    configService: ConfigService,
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {
    super(configService);
  }

  /**
   * Get() - User -> queries the user table
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Get()
  @PrivilegeHas(`user.get`)
  async Get(
    @Body() input: GetInput,
    @Request() req: CoreRequest,
  ): Promise<SyncListOutput | SyncDataOutput> {
    //This class inherits GenericController. We call handleGet() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleGet(input);
  }

  /**
   * handleList - User -> return array of hashes for the result set.
   * @param input parameters for the request
   */
  async handleList(input: GetInput) {
    let query = this.userService.createQueryBuilder().select('id', 'updateAt');

    /**
     * Apply Conditions to the query
     */
    switch (input.mode) {
      case GenericGetMode.All:
        //GenericGetMode.All -> get all rows, apply no condition
        break;
      case GenericGetMode.Discrete:
        //GenericGetMode.Discrete -> get only specific ids
        query = this.userService.applyCondition(query, input.ids);
        break;
      case GenericGetMode.ParameterSearch:
        //GenericGetMode.ParameterSearch -> get rows which match the search parameters
        query = this.userService.applyCondition(query, s => {
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
  async handleData(ids: number[]): Promise<Partial<GetOutput>[]> {
    let query: SelectQueryBuilder<User>;
    query = this.userService.createQueryBuilder();
    //query = query.select('mycolumn1', 'mycolumn2'); //Override which columns of the table are returned here, otherwise all are returned.
    query = this.userService.applyStems(query);
    return await query.getMany();
  }

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
    //Unlike traditional table logic, we use the userService object to manipulate
    //user data. This is because there is more under the hood which is required

    //1) Prepare to create new users by converting entries => entities
    let entities = input.entries.map(v => {
      let o: User = this.userRepository.create();

      o.username = v.username;

      o.firstName = v.firstName;

      o.lastName = v.lastName;

      o.emailAddress = v.emailAddress;

      if (!!v.role) {
        let c = new Role();
        c.id = v.role.id;
        o.role = c;
      }
      return o;
    });

    //2) Convert to an object which contains the user and the user password, in prep to call the service create method
    let wrapperEntities = entities.map((v, i) => {
      let uc: UserPwdWrapper = {
        user: v,
        password: input.entries[i].password,
      };
      return uc;
    });

    //3) Create all users
    let result = await promiseArray(
      wrapperEntities.map(u => this.userService.create(u.user, u.password)),
    );

    //Return result
    return { result: result };
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
    //Unlike traditional table logic, we use the userService object to manipulate
    //user data. This is because there is more under the hood which is required

    //1) convert entries to entities
    let toUpdate = input.entries.map((v, i) => {
      //duplicate the input value v to o. o stands for output
      let o: User = {};

      //Apply update to the property
      if (!!v.username) {
        o.username = v.username;
      }

      //Apply update to the property
      if (!!v.firstName) {
        o.firstName = v.firstName;
      }

      //Apply update to the property
      if (!!v.lastName) {
        o.lastName = v.lastName;
      }

      //Apply update to the property
      if (!!v.emailAddress) {
        o.emailAddress = v.emailAddress;
      }

      //Apply update to relationship
      if (!!v.role) {
        let c = new Role();
        c.id = v.role.id;
        o.role = c;
      }

      return o;
    });

    //2) convert to an object which contains the user and the user password
    let wrapperEntities: UserPwdWrapper[] = toUpdate.map((v, i) => {
      return {
        user: v,
        password: input.entries[i].password,
      };
    });

    //3) Update all users
    let result = await promiseArray(
      wrapperEntities.map(u => this.userService.update(u.user, u.password)),
    );

    //Return result
    return { result: result };
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
    //Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <User>{ id: v.id });

    //For each entry, find the row it pertains to.
    let toDelete: User[] = await promiseArray(
      toFind.map(v => this.userRepository.findOne(v)),
    );

    //All entries found... convert to an easier format for deletion
    let deleteIDs = toDelete.map(v => v.id);

    //Delete all entries at once
    await this.userRepository.delete(deleteIDs);

    //Return result
    return { result: deleteIDs };
  }
}
