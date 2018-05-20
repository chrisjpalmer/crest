/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Get, Controller, Param, Post } from '@nestjs/common';
import { AuthController, AuthService, InjectRepo, UserService } from 'core';
import { Repository } from 'typeorm';
import {
  User,
  UserToken,
  Role,
  RoleToken,
  Privilege,
  PrivilegeToken,
} from 'database';

//------------------------------------------------
//--------------------- INPUT --------------------
//------------------------------------------------

//-----------POST----------\\

//Input
class PostInput {}

//Output
class PostOutput {
  status: string;
}

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@Controller('init')
export class InitController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
    @InjectRepo(RoleToken) private readonly roleRepository: Repository<Role>,
    @InjectRepo(PrivilegeToken)
    private readonly privilegeRepository: Repository<Privilege>,
  ) {}

  @Post()
  async Post(): Promise<PostOutput> {
    let numberOfUsers = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id')
      .getCount();
    if (numberOfUsers > 0) {
      return { status: 'server is already initialized' };
    }
    //Root Privilege
    let rootPrivilege: Privilege = null;
    try {
      rootPrivilege = await this.privilegeRepository.findOneOrFail({
        name: 'root',
      });
    } catch {
      rootPrivilege = new Privilege();
      rootPrivilege.name = 'root';
      await this.privilegeRepository.save(rootPrivilege); //This operation will populate the id field of the object
    }

    let rootRole: Role = null;
    try {
      rootRole = await this.roleRepository.findOneOrFail({ name: 'root' });
    } catch {
      rootRole = new Role();
      rootRole.name = 'root';
      rootRole.privileges = [rootPrivilege];
      rootRole.description = 'The root role for total access';
      await this.roleRepository.save(rootRole);
    }

    let rootUser = new User();
    rootUser.username = 'root@root.com';
    rootUser.firstName = 'root';
    rootUser.lastName = 'root';
    rootUser.role = rootRole;
    await this.userService.create(rootUser, 'root');

    return {
      status: "server was initialized. user 'root@root.com' was created",
    };
  }
}
