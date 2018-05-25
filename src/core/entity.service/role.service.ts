/** BOILERPLATE - don't touch unless you are brave */
/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Component, BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Role, RoleToken } from 'database';
import {
  IndexSet,
  RepoAllType,
  StitchSet,
  InjectRepo,
  GenericEntityService,
} from 'core';
import { Privilege, User } from 'database';

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
      p => p.privileges.map(c => c.id),
      (p, c) => (p.privileges = c),
    );
  }

  fillWithUsers(
    role: Role | Role[] | Map<number, Role>,
    indexedUsers: Map<number, User>,
  ) {
    StitchSet(
      role,
      indexedUsers,
      p => p.users.map(c => c.id),
      (p, c) => (p.users = c),
    );
  }

  createQueryBuilder() {
    return this.roleRepository.createQueryBuilder(this.entity);
  }

  applyStems(query: SelectQueryBuilder<Role>): SelectQueryBuilder<Role> {
    return query
      .leftJoin(this.entity + '.privileges', 'privilege')
      .addSelect('privilege.id');
  }

  applyUserStems(query: SelectQueryBuilder<Role>): SelectQueryBuilder<Role> {
    return query.leftJoin(this.entity + '.users', 'user').addSelect('user.id');
  }
}
