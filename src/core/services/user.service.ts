import { Injectable } from '@nestjs/common';
import { UserModel, User, UserToken, RoleToken, Role } from 'database';
import { Repository } from 'typeorm';
import { InjectRepo } from '../core';

export namespace UserService {

  export interface CreateUserInput {
    username:string;
    firstName:string;
    lastName:string;
    roleId:number;
  }

  export interface UpdateUserInput {
    username?:string;
    firstName?:string;
    lastName?:string;
    roleId?:number;
  }

  export interface GetUsersFilteredInput {
    /**
     * Zero Indexed page to fetch of the data
     */
    page:number;
    /**
     * The number of entries for each page
     */
    pageSize:number;
  }

  export interface GetUsersFilteredOutput {
    users:GetUsersOutput[];
    currentPage:number;
    totalPages:number;
    totalEntries:number;
  }

  export interface GetUsersOutput {
    id:number;
    createdAt:Date;
    updatedAt:Date;
    username:string;
    firstName:string;
    lastName:string;
    roleId:number;
  }
  
  @Injectable()
  export class Service {
    constructor(@InjectRepo(UserToken) private userRepository:Repository<User>,
    @InjectRepo(RoleToken) private roleRepository:Repository<Role>) {}

    async getUsers() {
      let usersJustIds = await this.userRepository.createQueryBuilder('user').select('id').getMany();
      let userIds = usersJustIds.map(v => v.id);
      return await this.getUsersByIds(userIds);
    }

    private async getUsersByIds(userIds:number[]) {
      let output:GetUsersOutput[] = [];
      for(let i = 0; i < userIds.length; i++) {
        let userModel = await UserModel.forUserId(userIds[i], this.userRepository);

        //TODO: Ensure this doesnt throw errors on NULL VALUES
        output.push({
          id: userModel.getId(),
          createdAt: userModel.getCreatedAt(),
          updatedAt: userModel.getUpdatedAt(),
          username: userModel.getUsername(),
          firstName: userModel.getFirstName(),
          lastName: userModel.getLastName(),
          roleId: userModel.getRoleId(),
        });
      }

      return output;
    }

    async getUsersFiltered(params:GetUsersFilteredInput) : Promise<GetUsersFilteredOutput> {
      let usersJustIds = await this.userRepository.createQueryBuilder('user').select('id').skip(params.page * params.pageSize).take(params.pageSize).getMany();
      let userIds = usersJustIds.map(v => v.id);
      let users = await this.getUsersByIds(userIds);

      let noOfUsers = await this.userRepository.createQueryBuilder('user').getCount();

      return {
        users,
        currentPage: params.page,
        totalEntries:noOfUsers,
        totalPages: Math.ceil(noOfUsers / params.page)
      }
    }


    async createUser(createUser:CreateUserInput) {
      //Create a new user model
      let userModel = await UserModel.createNew(this.userRepository);

      //Set the properties of the user model... make sure we await any methods which return a promise
      await userModel.setUsername(createUser.username);
      userModel.setFirstName(createUser.firstName);
      userModel.setLastName(createUser.lastName);
      await userModel.setRoleId(createUser.roleId, this.roleRepository);
      
      //Save the user to the database.
      await userModel.save();
      
    }

    async updateUser(userId:number, updateUser:UpdateUserInput) {
      //Retrieve the user from the database by its user id...
      let userModel = await UserModel.forUserId(userId, this.userRepository);

      //Set the properties of the user if they are specified in the updateUser params
      if(!!updateUser.username) {
        await userModel.setUsername(updateUser.username); //TODO: handle case where the username is already the same..
      }

      if(!!updateUser.firstName) {
        userModel.setFirstName(updateUser.firstName);
      }

      if(!!updateUser.lastName) {
        userModel.setLastName(updateUser.lastName);
      }

      if(!!updateUser.roleId) {
        await userModel.setRoleId(updateUser.roleId, this.roleRepository);
      }

      //Save the user to the database
      await userModel.save();
    }

    async deleteUser(userId:number) {
      //Retrieve the user from the database by its user id...
      let userModel = await UserModel.forUserId(userId, this.userRepository);

      //Delete the user from the database.
      userModel.delete();
    }
  }
}
