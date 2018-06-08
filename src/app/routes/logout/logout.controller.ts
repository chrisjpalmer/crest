/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  Get,
  Controller,
  Param,
  Post,
  Body,
  Patch,
  Request,
} from '@nestjs/common';
import { AuthController, AuthService, InjectRepo, CoreRequest } from 'core';
import { PostInput, PostOutput } from './logout.class';

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@Controller('login')
export class LogoutController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    let user = await this.authService.deleteUserSession(
      req.user.currentSession,
    );
    return { sessionId: req.user.currentSession.id };
  }
}
