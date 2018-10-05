/** BOILERPLATE - don't touch unless you are brave */
/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserToken, UserModel, UserPasswordModel } from 'database';
import { GenericEntityService } from './generic.entity.service';
import { InjectRepo } from '../core/core.database.provider';
import { GenericRelation } from '../controller/post-patch';
import {
  Role,
  RoleToken,
  UserPassword,
  UserPasswordToken,
} from 'database';
import { UserServiceOutput, RoleServiceOutput, PrivilegeServiceOutput } from './service.output';
import { UserServiceInputDataOnly, UserServiceInputFull, UserServiceInputNoRelations } from './service.input';
import { ConfigService } from '../service';


export interface UserEntry {
  role: GenericRelation;
}

@Injectable()
export class UserService extends GenericEntityService<User> {
  constructor(
    private configService: ConfigService,
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
    @InjectRepo(RoleToken) private readonly roleRepository: Repository<Role>,
    @InjectRepo(UserPasswordToken)
    private readonly userPasswordRepository: Repository<UserPassword>,
  ) {
    super('user', 'username');
  }

  /**
   * Create a new user
   */
  async createUserDataOnly(userServiceInput: UserServiceInputDataOnly): Promise<number> {
    return this._createUser(userServiceInput);
  }

  async createUserNoRelations(userServiceInput: UserServiceInputNoRelations): Promise<number> {
    return this._createUser(userServiceInput);
  }

  async createUserFull(userServiceInput: UserServiceInputFull): Promise<number> {
    return this._createUser(userServiceInput);
  }

  private async _createUser(userServiceInput: UserServiceInputFull | UserServiceInputNoRelations | UserServiceInputDataOnly): Promise<number> {

    //Create a new user
    let userModel: UserModel = UserModel.createNew(this.userRepository);

    //Check that the user does not already exist
    try {
      await userModel.setUsername(userServiceInput.username);
    } catch (e) {
      throw new BadRequestException('the user already exists');
    }
    //Set properties on the user
    userModel.setFirstName(userServiceInput.firstName);
    userModel.setLastName(userServiceInput.lastName);
    userModel.setEmailAddress(userServiceInput.emailAddress);

    if(!!(<UserServiceInputFull>userServiceInput).roleId) {
      userModel.setRoleId((<UserServiceInputFull>userServiceInput).roleId, this.roleRepository);
    }

    //Save the user
    let userId = await userModel.save();

    //Set the user's password
    if(!!(<UserServiceInputFull>userServiceInput).password) {
      let userPasswordModel: UserPasswordModel = UserPasswordModel.createNew(this.userPasswordRepository, this.configService.auth.saltRounds);
      await userPasswordModel.setPassword((<UserServiceInputFull>userServiceInput).password);
      userPasswordModel.setUserId(userId, this.userRepository);
      await userPasswordModel.save();
    }

    return userId;
  }

  /**
   * Update the user
   * @param id 
   * @param userServiceInput 
   */
  async updateUser(idOrUsername: number | string, userServiceInput: Partial<UserServiceInputFull>): Promise<number> {
    let userModel: UserModel;
    if (typeof idOrUsername === 'number') {
      userModel = await UserModel.forUserId(idOrUsername, this.userRepository);
    } else {
      userModel = await UserModel.forUsername(idOrUsername, this.userRepository);
    }

    let userId = userModel.getId();

    if (!!userServiceInput.username) {
      await userModel.setUsername(userServiceInput.username);
    }
    if (!!userServiceInput.firstName) {
      userModel.setFirstName(userServiceInput.firstName);
    }
    if (!!userServiceInput.lastName) {
      userModel.setLastName(userServiceInput.lastName);
    }
    if (!!userServiceInput.emailAddress) {
      userModel.setEmailAddress(userServiceInput.emailAddress);
    }
    if (!!userServiceInput.roleId) {
      userModel.setRoleId(userServiceInput.roleId, this.roleRepository);
    }

    await userModel.save();

    if (!!userServiceInput.password) {
      let userPasswordModel: UserPasswordModel = await UserPasswordModel.forUserId(userId, this.userPasswordRepository, this.configService.auth.saltRounds);
      await userPasswordModel.setPassword(userServiceInput.password);
      await userPasswordModel.save();
    }

    return userId;
  }

  /**
   * delete existing user
   * @param idOrUsername
   */
  async deleteUser(idOrUsername: number | string): Promise<number> {
    let userModel: UserModel;
    if (typeof idOrUsername === 'number') {
      userModel = await UserModel.forUserId(idOrUsername, this.userRepository);
    } else {
      userModel = await UserModel.forUsername(idOrUsername, this.userRepository);
    }
    let userId = userModel.getId();

    //Delete the user password
    let userPasswordModel = await UserPasswordModel.forUserId(userId, this.userPasswordRepository, this.configService.auth.saltRounds);
    await userPasswordModel.delete();

    //Delete the user
    await userModel.delete();

    return userId;
  }

  /**
   * returns a UserServiceOutput object which represents the user with all its roles and privileges
   * @param userId 
   */
  async getFullUser(idOrUsername: number | string): Promise<UserServiceOutput> {
    let userModel: UserModel;
    if (typeof idOrUsername === 'number') {
      userModel = await UserModel.forUserId(idOrUsername, this.userRepository);
    } else {
      userModel = await UserModel.forUsername(idOrUsername, this.userRepository);
    }

    let roleServiceOutput: RoleServiceOutput = null;
    let userServiceOutput: UserServiceOutput = null;
    let privilegeServiceOutputs: PrivilegeServiceOutput[] = [];
    let roleId:number = null;


    //Try and get the role information if it exists. If it does not, handle the failure in this try block and dont worry too much
    try {
      roleId = userModel.getRoleId();

      let role = await this.roleRepository.createQueryBuilder('role')
        .leftJoin('role.privilege', 'privilege')
        .addSelect(['privilege.id', 'privilege.updatedAt', 'privilege.createdAt', 'privilege.name'])
        .where('id = :roleId', { roleId: roleId })
        .getOne();

      privilegeServiceOutputs = role.privileges.map(privilege => {
        let privilegeServiceOutput: PrivilegeServiceOutput = {
          id: privilege.id,
          updatedAt: privilege.updatedAt,
          createdAt: privilege.createdAt,
          name: privilege.name,
        }
        return privilegeServiceOutput;
      })

      roleServiceOutput = {
        id: role.id,
        updatedAt: role.updatedAt,
        createdAt: role.createdAt,
        name: role.name,

        privileges: privilegeServiceOutputs,
      }
    } finally { }

    userServiceOutput = {
      id: userModel.getId(),
      updatedAt: userModel.getUpdatedAt(),
      createdAt: userModel.getCreatedAt(),

      username: userModel.getUsername(),
      firstName: userModel.getFirstName(),
      lastName: userModel.getLastName(),
      emailAddress: userModel.getEmailAddress(),

      role: roleServiceOutput,
      roleId: roleId,
    };

    return userServiceOutput;
  }

  async getUserData(idOrUsername: number | string){
    let userModel: UserModel;
    if (typeof idOrUsername === 'number') {
      userModel = await UserModel.forUserId(idOrUsername, this.userRepository);
    } else {
      userModel = await UserModel.forUsername(idOrUsername, this.userRepository);
    }

    let roleId:number = null;
    try {
      roleId = userModel.getRoleId();
    } finally {}

    let userServiceOutput: UserServiceOutput = {
      id: userModel.getId(),
      updatedAt: userModel.getUpdatedAt(),
      createdAt: userModel.getCreatedAt(),

      username: userModel.getUsername(),
      firstName: userModel.getFirstName(),
      lastName: userModel.getLastName(),
      emailAddress: userModel.getEmailAddress(),

      role: null,
      roleId: roleId,
    };

    return userServiceOutput;
  }
}

