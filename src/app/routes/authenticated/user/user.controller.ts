/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  AuthController,
  PrivilegeHas,
  CoreRequest,
} from 'core';
import {
  Get,
  Body,
  Post,
  Patch,
  Request,
  Delete,
  Controller,
  Query,
} from '@nestjs/common';
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
import { transformAndValidate } from 'class-transformer-validator';
import { UserService } from 'core/services/user.service';


//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
/* http://localhost:3000/authenticated/user */
@AuthController('user')
export class UserController {
  constructor(private userService:UserService.Service) {}

  /**
   * Get() - User
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Get()
  @PrivilegeHas('user.get')
  async Get(
    @Query('input') _input: string,
    @Request() req: CoreRequest,
  ): Promise<GetOutput> {
    //Transform the only query parameter 'input' from JSON string to an object
    let input: GetInput = JSON.parse(_input);
    // Metdata set on GetInput ensures that the input is validated correctly
    input = await transformAndValidate(GetInput, input); 

    //Get the users using the User Service
    let filteredResult = await this.userService.getUsersFiltered({
      page: input.page,
      pageSize: input.pageSize,
    });

    //Transform the output
    let output:GetOutput = {
      totalEntries: filteredResult.totalEntries,
      totalPages: filteredResult.totalPages,
      users: filteredResult.users.map(u => {
        return {
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName
        }
      })

    };


    return output;
  }

  /**
   * Post() - User
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Post()
  @PrivilegeHas('user.post')
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    return null;
  }

  /**
   * Patch() - User
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Patch()
  @PrivilegeHas('user.patch')
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    return null;
  }

  /**
   * Delete() - User
   * @param input parameters for the request
   * @param req the expressjs request object
   */
  @Delete()
  @PrivilegeHas('user.delete')
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    return null;
  }
}
