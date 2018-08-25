/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Get, Controller, Param, Post, Body, Patch } from '@nestjs/common';
import { AuthController, AuthService, UserService, InjectRepo } from 'core';
import { Repository } from 'typeorm';
import { Role, RoleToken } from 'database';
import { PostInput, PostOutput } from './login.class';

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@Controller('login')
export class LoginController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @InjectRepo(RoleToken) private readonly roleRepository: Repository<Role>,
  ) {}

  @Post()
  async Post(@Body() input: PostInput): Promise<PostOutput> {
    let userId = await this.authService.validatePassword(
      input.username,
      input.password,
    );
    let token = await this.authService.createUserSession(userId);
    return { token };
  }
}
