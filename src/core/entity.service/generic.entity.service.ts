/** BOILERPLATE - don't touch unless you are brave */

import { RepoAllType, IndexSet } from '../core/core.database.util';
import { SelectQueryBuilder } from 'typeorm';
import { SyncHash, SyncData, SyncRaw } from '../request/sync';
import { GenericEntity } from 'database';

/** A function which should contain conditional SELECT logic.
 * It accepts a parameter s, representing the current selectQueryBuilder object.
 * It should perform chainable operations on this object and return the result. */
export type SelectModifier<T> = (
  s: SelectQueryBuilder<T>,
) => SelectQueryBuilder<T>;

/**
 * EntityService abstracts common database operations.
 * However it is not intended to be an end to end abstraction of
 * the TypeORM repository class - nor should it be
 * common select operations have been generalised through this class.
 */
export class GenericEntityService<T extends GenericEntity> {
  /**
   * Setup entity service and it will create common select functionality for you
   * Remember you must override the selectQueryBuilder function
   * @param entity the lowercase name of the entity e.g. 'privilege'
   * @param nameColumn the unique string column that is associated with each row of the entity e.g. 'name' OR 'username'
   */
  constructor(protected entity: string, protected nameColumn?: string) {}
  async existsById(id: number): Promise<boolean> {
    return !!await this.findById(id);
  }

  async existsByName(name: string): Promise<boolean> {
    return !!await this.findByName(name);
  }

  async findById(id: number): Promise<T> {
    return this.selectQueryBuilder()
      .whereInIds([id])
      .getOne();
  }

  async findByName(name: string): Promise<T> {
    if (!this.nameColumn) {
      throw 'finding by name does not work if a unique index does not exist on the table';
    }
    return this.selectQueryBuilder()
      .where(`${this.entity}.${this.nameColumn} = :name`, { name })
      .getOne();
  }

  /**
   * findIndexed performs a select query and returns the set as a map, indexed by id.
   * @param condition id[], single id, RepoAll (fetches all data), custom condition function
   * @param page [optional] the 0ed page number - pagination breaks the dataset into 'pages' of an arbitrary size, allowing subsets of the overall dataset to be retrieved
   * @param pageSize [required for pagination] the size of each page for pagination
   */
  async findIndexed(
    condition?: number[] | number | SelectModifier<T>,
    page?: number,
    pageSize?: number,
  ): Promise<Map<number, T>> {
    let finalQuery = this.queryBuild();

    return IndexSet(await finalQuery.getMany(), v => v.id);
  }

  async findSyncHash(
    condition?: number[] | number | SelectModifier<T>,
    page?: number,
    pageSize?: number,
  ): Promise<SyncHash> {
    let finalQuery = this.queryBuild();

    let syncRaws = (await finalQuery.getMany()).map(
      v => new SyncRaw(v.id, v.updatedAt),
    );
    return <SyncHash>IndexSet(syncRaws, v => v.id);
  }

  /** TODO: implement a thin AND fat query type where we can just get, user.id AND user.updatedAt */
  private queryBuild(
    condition?: number[] | number | SelectModifier<T>,
    page?: number,
    pageSize?: number,
  ) {
    let query = this.selectQueryBuilder();

    //Apply CONDITIONS - through Where
    let finalQuery: SelectQueryBuilder<T> = null;
    if (typeof condition === 'number') {
      finalQuery = query.whereInIds([condition]);
    } else if (typeof condition === 'object') {
      finalQuery = query.whereInIds(condition);
    } else if (typeof condition === 'function') {
      finalQuery = condition(finalQuery);
    } else {
      //undefined or null - get all data
      finalQuery = query;
    }

    //Apply PAGINIATION - through skip and take
    if (!!page && !!pageSize) {
      finalQuery = finalQuery.skip(page * pageSize).take(pageSize);
    }
    return finalQuery;
  }

  //fill is not defined BUT will be defined by the superclass

  /**
   * selectQueryBuilder - override this and return the generic select statement that will be used
   * for all select operations within EntityService
   */
  protected selectQueryBuilder(): SelectQueryBuilder<T> {
    return null;
  }
}
