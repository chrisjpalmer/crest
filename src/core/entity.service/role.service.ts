/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Component } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Role, RoleToken } from 'database';
import { GenericEntityService } from './generic.entity.service';
import { InjectRepo } from '../core/core.database.provider';
import { StitchSet } from '../core/core.database.util';
import { PostRelation, PatchRelation } from '../controller/post-patch';
import { Privilege, PrivilegeToken, User, UserToken } from 'database';

interface PostInputRole {
  privileges: PostRelation[];
}

interface PatchInputRole {
  privileges: PatchRelation[];
}

@Component()
export class RoleService extends GenericEntityService<Role> {
  constructor(
    @InjectRepo(RoleToken) private readonly roleRepository: Repository<Role>,
    @InjectRepo(PrivilegeToken)
    private readonly privilegeRepository: Repository<Privilege>,
    @InjectRepo(UserToken) private readonly userRepository: Repository<User>,
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
    return this.roleRepository.createQueryBuilder(this.mainTableAlias);
  }

  applyStemsPrivileges(
    query: SelectQueryBuilder<Role>,
  ): SelectQueryBuilder<Role> {
    return query
      .leftJoin(this.mainTableAlias + '.privileges', 'privilege')
      .addSelect('privilege.id');
  }
  applyStemsUsers(query: SelectQueryBuilder<Role>): SelectQueryBuilder<Role> {
    return query
      .leftJoin(this.mainTableAlias + '.users', 'user')
      .addSelect('user.id');
  }

  async pingStemsPrivileges(
    entries: (PostInputRole | PatchInputRole)[],
  ): Promise<void> {
    let relations: (PostRelation | PatchRelation)[] = [];
    entries.map(v => v.privileges).forEach(r => {
      if(!!r) {
        relations.push(...r)
      }
    });
    let pingList = this.relationsToPingIds(relations);

    await this.privilegeRepository
      .createQueryBuilder('privilege')
      .update({ updatedAt: new Date() })
      .whereInIds(pingList)
      .execute();
  }
}
