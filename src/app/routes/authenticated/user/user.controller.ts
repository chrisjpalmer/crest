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
  GenericGetInput,
  GenericGetOutput,
  promiseArray,
  CoreRequest,
  UserService,
} from 'core';
import { Repository } from 'typeorm';
import { Get, Body, Post, Patch, Request, Delete } from '@nestjs/common';
import {
  PostInput,
  PostOutput,
  PatchInput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
} from './user.input';
import { User, UserToken } from 'database';

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('user') /* http://localhost:3000/authenticated/user */
export class UserController extends GenericController<User> {
  constructor(
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {
    super(userService);
  }

  /**
   * Get() - User -> queries the user table
   * @param input
   */
  @Get()
  @PrivilegeHas(`user.get`)
  async Get(@Body() input: GenericGetInput): Promise<GenericGetOutput<User>> {
    //This class inherits GenericGetController. We call handleGet() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleGet(input);
  }

  /**
   * Post() - User -> creates new users
   * @param input
   */
  @Post()
  @PrivilegeHas(`user.post`)
  async Post(@Body() input: PostInput): Promise<PostOutput> {
    //Unlike traditional table logic, we use the userService object to manipulate
    //user data. This is because there is more under the hood which is required

    //Transform input data to user data
    let toCreate: { user: User; password: string }[] = input.entries.map(v => {
      return {
        user: <User>{
          username: v.username,
          firstName: v.firstName,
          lastName: v.lastName,
          emailAddress: v.emailAddress,
        },
        password: v.password,
      };
    });

    //Create all users
    let result = await promiseArray(
      toCreate.map(u => this.userService.create(u.user, u.password)),
    );

    //Return result
    return { result: result };
  }

  /**
   * Patch() - User -> updates users
   * @param input
   */
  @Patch()
  @PrivilegeHas(`user.patch`)
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    //Unlike traditional table logic, we use the userService object to manipulate
    //user data. This is because there is more under the hood which is required

    //typically there is a 4 phase process for performing patch:
    //1) convert - convert entries to entities with only their id, for phase 2
    //2) find - find the entites
    //3) apply - apply the changes from the entries to the entites
    //4) save - save the entities

    //here we have this:
    //1) convert
    //2) update -> find + apply + save

    //convert entries => entities
    let toUpdate: { user: User; password: string }[] = input.entries.map(v => {
      return {
        user: <User>{
          username: v.username,
          firstName: v.firstName,
          lastName: v.lastName,
          emailAddress: v.emailAddress,
        },
        password: v.password,
      };
    });

    //Update all users
    let result = await promiseArray(
      toUpdate.map(u => this.userService.update(u.user, u.password)),
    );

    //Return result
    return { result: result };
  }

  /**
   * Delete() - User -> deletes users
   * @param input
   */
  @Delete()
  @PrivilegeHas(`user.delete`)
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    //Unlike traditional table logic, we use the userService object to manipulate
    //user data. This is because there is more under the hood which is required

    //convert entries => entities
    let toDelete: User[] = input.entries.map(v => {
      return <User>{ id: v.id };
    });

    //Update all users
    let result = await promiseArray(
      toDelete.map(u => this.userService.delete(u)),
    );

    //Return result
    return { result: result };
  }
}
