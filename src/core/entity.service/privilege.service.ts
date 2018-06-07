/** BOILERPLATE - don't touch unless you are brave */
/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Component, BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Privilege, PrivilegeToken } from 'database';
import { GenericEntityService } from './generic.entity.service';
import { InjectRepo } from '../core/core.database.provider';
import { StitchSet } from '../core/core.database.util';
import { Role } from 'database';

@Component()
export class PrivilegeService extends GenericEntityService<Privilege> {
  constructor(
    @InjectRepo(PrivilegeToken)
    private readonly privilegeRepository: Repository<Privilege>,
  ) {
    super('privilege', 'name');
  }

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

  createQueryBuilder() {
    return this.privilegeRepository.createQueryBuilder(this.mainTableAlias);
  }

  applyStems(
    query: SelectQueryBuilder<Privilege>,
  ): SelectQueryBuilder<Privilege> {
    return query
      .leftJoin(this.mainTableAlias + '.roles', 'role')
      .addSelect('role.id');
  }
}
