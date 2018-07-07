/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ${entity.upper}, ${entity.upper}Token } from 'database';
import {
  StitchSet,
  InjectRepo,
  GenericEntityService,
  GenericRelation,
} from 'core';
///cust:importChildEntitiesAndTokens

interface Entry {
  ///ref:{"mode":"childEntity.multipleSingle", "templateFile":"service/entry.interface/template"}
}

@Injectable()
export class ${entity.upper}Service extends GenericEntityService<${entity.upper}> {
  constructor(
    @InjectRepo(${entity.upper}Token)
    private readonly ${entity.lower}Repository: Repository<${entity.upper}>,
    ///ref:{"mode":"childEntity.normal", "templateFile":"service/repository/template"}
  ) {
    ///ref:{"mode":"entity.uniqueNonUnique", "templateFile":"service/super.call/template"}
  }

  /**
   * createQueryBuilder - convenience abstraction of repository.createQueryBuilder(tableAlias)
   */
  createQueryBuilder() {
    return this.${entity.lower}Repository
      .createQueryBuilder(this.mainTableAlias);
  }

  /**
   * Fill with methods  
   */  
  ///ref:{"mode":"childEntity.multipleSingle", "templateFile":"service/fill.with/template"}

  /**
   * Apply Stems methods  
   */  
  ///ref:{"mode":"childEntity.normal", "templateFile":"service/apply.stems/template"}

  /**
   * Ping Stems methods  
   */  
  ///ref:{"mode":"childEntity.multipleSingle", "templateFile":"service/ping.stems/template"}
}
