import { GenericModel, GenericModelActions } from '../core/generic.model';
import { Role } from './role.entity';
import { Repository } from 'typeorm';
import { Privilege } from './privilege.entity';

export class RoleModel extends GenericModel<Role>
  implements GenericModelActions {
  private constructor(entity: Role, private roleRepository: Repository<Role>) {
    super(entity, 'RoleModel');
  }

  /**
   * Factories
   */

  static createNew(roleRepository: Repository<Role>) {
    let role: Role = roleRepository.create();
    return new RoleModel(role, roleRepository);
  }

  static async forRoleId(roleId: number, roleRepository: Repository<Role>) {
    let role: Role = null;
    //Pull any related data which is necessary for this model to operate here
    try {
      role = await roleRepository
        .createQueryBuilder('role')
        .leftJoin('role.privilege', 'privilege')
        .addSelect('privilege.id')
        .where('role.id = :roleId', { roleId })
        .getOne();
    } finally {
    }

    if (!role) {
      throw `role object does not exist for ${roleId}`;
    }

    return new RoleModel(role, roleRepository);
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
    await this.roleRepository.save(this.entity);

    return this.entity.id;
  }

  async delete() {
    if (!this.entity) {
      this.throwEntityNotSet();
    }

    await this.roleRepository.delete(this.entity);
  }

  /**
   * Data getters and setters
   */

  async setName(name: string) {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    //Duplicate check
    if (this.isNew()) {
      let result = await this.roleRepository.findOne({ name: name });
      if (!!result) {
        throw 'the role already exists';
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
   * Related entities getters and setters
   */



  /**
   * Adds a privilege to this role. It throws an error if the privilege does not exist.
   * If the privilege is already associated with the role, no error is thrown.
   * @param privilegeId
   * @param privilegeRepository
   */
  async addPrivilege(
    privilegeId: number,
    privilegeRepository: Repository<Privilege>,
  ) {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    if (!this.entity.privileges) {
      this.entity.privileges = [];
    }

    let i = this.entity.privileges.findIndex(
      entity => entity.id === privilegeId,
    );
    if (i !== -1) {
      return;
    }

    let privilege = await privilegeRepository.findOneOrFail(privilegeId);
    this.entity.privileges.push(privilege);
  }

  /**
   * Deletes a privilege from the privilege. If the privilege is not associated, no error is thrown.
   * @param privilegeId
   */
  deletePrivilege(privilegeId: number) {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    if (!this.entity.privileges) {
      return;
    }

    let i = this.entity.privileges.findIndex(
      entity => entity.id === privilegeId,
    );
    if (i !== -1) {
      this.entity.privileges.splice(i, 1);
    }
  }

  getPrivilegeIds() : number[] {
    if (!this.entity) {
      this.throwEntityNotSet();
    }
    if (!this.entity.privileges) {
      return [];
    }
    return this.entity.privileges.map(entity => entity.id);
  }
}
