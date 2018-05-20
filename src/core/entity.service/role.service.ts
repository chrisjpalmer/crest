/** BOILERPLATE - don't touch unless you are brave */
import { Component } from '@nestjs/common';
import { Role, RoleToken, Privilege } from 'database';
import { IndexSet, StitchSet, RepoAllType } from '../core/core.database.util';
import { InjectRepo } from '../core/core.database.provider';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GenericEntityService } from './generic.entity.service';

@Component()
export class RoleService extends GenericEntityService<Role> {
  constructor(
    @InjectRepo(RoleToken) private readonly roleRepository: Repository<Role>,
  ) {
    super('role', 'name');
  }

  fillWithPrivileges(
    role: Role | Role[] | Map<number, Role>,
    indexedPrivileges: Map<number, Privilege>,
  ) {
    StitchSet(
      role,
      indexedPrivileges,
      r => r.privileges.map(p => p.id),
      (r, p) => (r.privileges = p),
    );
  }

  protected selectQueryBuilder() {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoin('role.privileges', 'privilege')
      .addSelect('privilege.id');
  }
}
