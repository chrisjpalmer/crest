import { Injectable } from '@nestjs/common';
import { RoleModel, Role, RoleToken } from 'database';
import { Repository } from 'typeorm';
import { InjectRepo } from '../core';

export namespace RoleService {

  export interface CreateRole {

  }

  export interface UpdateRole {

  }

  export interface GetRolesFilterParams {

  }
  
  @Injectable()
  export class Service {
    constructor(@InjectRepo(RoleToken) private roleRepository:Repository<Role>) {}

    getRoles() {

    }

    async createRole(createRole:CreateRole) {
      let userModel = await RoleModel.createNew(this.roleRepository);
      
    }

    updateRole(roleId:number, updateRole:UpdateRole) {

    }

    deleteUser(roleId:number) {

    }
  }
}
