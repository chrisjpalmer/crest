import {
  GenericModel,
  GenericModelActions,
} from '../core/generic.model';
import { Privilege } from './privilege.entity';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

export class PrivilegeModel extends GenericModel<Privilege>
  implements GenericModelActions {
  private constructor(
    entity: Privilege,
    private privilegeRepository: Repository<Privilege>,
  ) {
    super(entity, 'PrivilegeModel');
  }

  /**
   * Factories
   */

  static createNew(privilegeRepository: Repository<Privilege>) {
    let privilege: Privilege = privilegeRepository.create();
    return new PrivilegeModel(privilege, privilegeRepository);
  }

  static async forPrivilegeId(
    privilegeId: number,
    privilegeRepository: Repository<Privilege>,
  ) {
    let privilege: Privilege = null;
    //Pull any related data which is necessary for this model to operate here
    try {
      privilege = await privilegeRepository
        .createQueryBuilder('privilege')
        .leftJoin('privilege.role', 'role')
        .addSelect('role.id')
        .where('privilege.id = :privilegeId', { privilegeId })
        .getOne();
    } finally {
    }

    if (!privilege) {
      throw `privilege object does not exist for ${privilegeId}`;
    }

    return new PrivilegeModel(privilege, privilegeRepository);
  }

  /**
   * Actions
   */

  async save() {
    //Prechecks
    if (!this.entity) {
      this.throwEntityNotSet();
    }

    //Update the entity
    this.updateUpdatedAt();
    await this.privilegeRepository.save(this.entity);

    return this.entity.id;
  }

  async delete() {
    if (!this.entity) {
      this.throwEntityNotSet();
    }

    await this.privilegeRepository.delete(this.entity);
  }

  /**
   * Data getters and setters
   */

   /** Sets the name of the privilege. If the the privilege already has a name associated with it, an error is thrown */
  async setName(name: string) {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    //Duplicate check
    if (this.isNew()) {
      let result = await this.privilegeRepository.findOne({
        name: name,
      });
      if (!!result) {
        throw 'privilege already exists';
      }
    }
    this.entity.name = name;
  }

  getName() {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    return this.entity.name;
  }

  /**
   * Adds a role to this privilege. It throws an error if the role does not exist.
   * If the role is already associated with the privilege, no error is thrown.
   * @param roleId 
   * @param roleRepository 
   */
  async addRole(roleId:number, roleRepository:Repository<Role>) {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    if (!this.entity.roles) {
      this.entity.roles = [];
    }

    let i = this.entity.roles.findIndex(entity => entity.id === roleId);
    if(i !== -1) {
      return;
    }

    let role = await roleRepository.findOneOrFail(roleId);
    this.entity.roles.push(role);
  }

  /**
   * Deletes a role from the privilege. If the role is not associated, no error is thrown.
   * @param roleId 
   */
  deleteRole(roleId:number) {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    if (!this.entity.roles) {
      return;
    }

    let i = this.entity.roles.findIndex(entity => entity.id === roleId);
    if(i !== -1) {
      this.entity.roles.splice(i, 1);
    }
  }

  getRoleIds() : number[] {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    if (!this.entity.roles) {
      return [];
    }
    return this.entity.roles.map(entity => entity.id);
  }
}
