/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Component, BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ${entity.upper}, ${entity.upper}Token } from 'database';
import {
  IndexSet,
  RepoAllType,
  StitchSet,
  InjectRepo,
  GenericEntityService,
} from 'core';
/// < entity.imports.template >

@Component()
export class ${entity.upper}Service extends GenericEntityService<${entity.upper}> {
  constructor(
    @InjectRepo(${entity.upper}Token)
    private readonly ${entity.lower}Repository: Repository<${entity.upper}>,
  ) {
    /// < entity.service.supercall.template >
  }

  /// < entity.service.fillWith.template >

  createQueryBuilder() {
    return this.${entity.lower}Repository
      .createQueryBuilder(this.mainTableAlias);
  }

  
  /// < entity.service.selectQueryBuilder.template >
}
