/** BOILERPLATE - don't touch unless you are brave */
import { Component } from '@nestjs/common';
import { Privilege, PrivilegeToken } from 'database';
import { IndexSet, RepoAllType } from '../core/core.database.util';
import { InjectRepo } from '../core/core.database.provider';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GenericEntityService } from './generic.entity.service';

@Component()
export class PrivilegeService extends GenericEntityService<Privilege> {
  constructor(
    @InjectRepo(PrivilegeToken)
    private readonly privilegeRepository: Repository<Privilege>,
  ) {
    super('privilege', 'name');
  }

  protected selectQueryBuilder() {
    return this.privilegeRepository.createQueryBuilder(this.entity);
  }
}
