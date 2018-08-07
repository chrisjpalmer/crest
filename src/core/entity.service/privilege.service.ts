/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Privilege, PrivilegeToken } from 'database';
import { GenericEntityService } from './generic.entity.service';
import { InjectRepo } from '../core/core.database.provider';
import { StitchSet } from '../core/core.database.util';
import { GenericRelation } from '../controller/post-patch';
import { Role, RoleToken } from 'database';

export interface PrivilegeEntry {
  roles: GenericRelation[];
}

@Injectable()
export class PrivilegeService extends GenericEntityService<Privilege> {
  constructor(
    @InjectRepo(PrivilegeToken)
    private readonly privilegeRepository: Repository<Privilege>,
    @InjectRepo(RoleToken) private readonly roleRepository: Repository<Role>,
  ) {
    super('privilege', 'name');
  }

  /**
   * createQueryBuilder - convenience abstraction of repository.createQueryBuilder(tableAlias)
   */
  createQueryBuilder() {
    return this.privilegeRepository.createQueryBuilder(this.mainTableAlias);
  }

  /**
   * Fill with methods
   */

  fillWithRoles(
    privilege: Privilege | Privilege[] | Map<number, Privilege>,
    indexedRoles: Map<number, Role>,
  ) {
    StitchSet(
      privilege,
      indexedRoles,
      p => p.roles.map(c => c.id),
      (p, c) => (p.roles = c),
    );
  }

  /**
   * Apply Stems methods
   */

  applyStemsRoles(
    query: SelectQueryBuilder<Privilege>,
  ): SelectQueryBuilder<Privilege> {
    return query
      .leftJoin(this.mainTableAlias + '.roles', 'role')
      .addSelect('role.id');
  }

  /**
   * Ping Stems methods
   */

  async pingStemsRoles(entries: PrivilegeEntry[]): Promise<void> {
    let relations: GenericRelation[] = [];
    entries.map(v => v.roles).forEach(r => {
      if (!!r) {
        relations.push(...r);
      }
    });
    let pingList = this.relationsToPingIds(relations);

    await this.roleRepository
      .createQueryBuilder('role')
      .update({ updatedAt: () => 'CURRENT_TIMESTAMP(6)' })
      .whereInIds(pingList)
      .execute();
  }
}
