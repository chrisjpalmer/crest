/** BOILERPLATE - don't touch unless you are brave */

import { RepoAllType, IndexSet } from '../core/core.database.util';
import { SelectQueryBuilder } from 'typeorm';
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
   * @param mainTableAlias the lowercase name of the entity e.g. 'privilege', this is initialized through a call to super()
   * @param nameColumn the unique string column that is associated with each row of the entity e.g. 'name' OR 'username', this is initiailzed through a call to super()
   */
  constructor(
    protected mainTableAlias: string,
    protected nameColumn?: string,
  ) {}
  async existsById(id: number): Promise<boolean> {
    return !!await this.findById(id);
  }

  async existsByName(name: string): Promise<boolean> {
    return !!await this.findByName(name);
  }

  async findById(id: number): Promise<T> {
    return this.applyStems(this.createQueryBuilder())
      .whereInIds([id])
      .getOne();
  }

  async findByName(name: string): Promise<T> {
    if (!this.nameColumn) {
      throw 'finding by name does not work if a unique index does not exist on the table';
    }
    return this.applyStems(this.createQueryBuilder())
      .where(`${this.mainTableAlias}.${this.nameColumn} = :name`, { name })
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
    let query = this.applyStems(this.createQueryBuilder());
    if (!!condition) {
      query = this.applyCondition(query, condition);
    }

    if (!!page) {
      query = this.applyPagination(query, page, pageSize);
    }

    return IndexSet(await query.getMany(), v => v.id);
  }

  /**
   * createQueryBuilder - abstracts the reposistory.createQueryBuilder method and
   * should use the this.entity property to standardize the table alias for future queries.
   * SHOULD BE OVERIDDEN BY SUB CLASS.
   */
  createQueryBuilder(): SelectQueryBuilder<T> {
    return null;
  }

  /**
   * transformColumns - prepends the mainTableAlias to each column. If the table was called 'message' and the columns variable were ['id'], it would output: ['message.id']
   * @param columns columns to prepend the mainTableAlias to
   */
  transformColumns(columns: string[]): string[] {
    return columns.map(c => `${this.mainTableAlias}.${c}`);
  }

  /**
   * applyCondition - a convenience method for applying conditions to the query
   * @param query the query to manipulate
   * @param condition an array of ids, a single id OR a SelectModifier - a function which manipulates the query and returns the resulting query
   */
  applyCondition(
    query: SelectQueryBuilder<T>,
    condition: number[] | number | SelectModifier<T>,
  ) {
    if (typeof condition === 'number') {
      query = query.whereInIds([condition]);
    } else if (typeof condition === 'object') {
      query = query.whereInIds(condition);
    } else if (typeof condition === 'function') {
      query = condition(query);
    } else {
      throw 'condition argument was null or undefined to applyCondition()';
    }

    return query;
  }

  /**
   *
   * @param query
   * @param page
   * @param pageSize
   */
  applyPagination(
    query: SelectQueryBuilder<T>,
    page: number,
    pageSize: number,
  ) {
    if (!page || !pageSize) {
      throw 'pagination parameters were not defined properly';
    }
    query = query.skip(page * pageSize).take(pageSize);
    return query;
  }

  /**
   * applyStems - inner joins related tables BUT only selects stem columns.
   * SHOULD BE OVERIDDEN BY SUB CLASS.
   *
   * TypeORM can inner join multiple tables and place the related tables as subobjects of the main entity in the query.
   *
   * Typically you would select all the columns of all the tables. However this results in a very large result set.
   * If 10 rows in A are each related to 10 rows in B, 100 rows of data are sent back. If A has 10 columns and B has 10 columns, the payload is 100 x (10 + 10) = 2000.
   * However if we only select the id column of B (refered to as a Stem row), then the payload is < 100 x 11 = 1100.
   *
   * How can we then retrieve the full row of B? By making a seperate query to B and then 'Stitching' result sets together.
   *
   * Its preferable to leave 'Stitching' to the client application of this web server, to even reduce the HTTP results going back to the client.
   * @param query
   */
  applyStems(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    return null;
  }
}
