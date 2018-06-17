/** BOILERPLATE - don't touch unless you are brave */

import { IndexSet } from '../core/core.database.util';
import { SelectQueryBuilder } from 'typeorm';
import { GenericEntity } from 'database';
import { GenericRelation } from '../controller/post-patch';

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

  async findById(id: number, modifier?: SelectModifier<T>): Promise<T> {
    let query = this.createQueryBuilder().whereInIds([id]);
    if (!!modifier) {
      query = modifier(query);
    }
    return query.getOne();
  }

  async findByName(name: string, modifier?: SelectModifier<T>): Promise<T> {
    if (!this.nameColumn) {
      throw 'finding by name does not work if a unique index does not exist on the table';
    }
    let query = this.createQueryBuilder().where(
      `${this.mainTableAlias}.${this.nameColumn} = :name`,
      { name },
    );
    if (!!modifier) {
      query = modifier(query);
    }
    return query.getOne();
  }

  /**
   * findIndexed performs a select query and returns the set as a map, indexed by id.
   * @param ids an id or ids to limit the result set
   * @param modifier a function which modifies the query in some way using typeORM chainable functions
   * @param page [optional] the 0ed page number - pagination breaks the dataset into 'pages' of an arbitrary size, allowing subsets of the overall dataset to be retrieved
   * @param pageSize [required for pagination] the size of each page for pagination
   */
  async findIndexed(
    ids?: number[] | number,
    modifier?: SelectModifier<T>,
    page?: number,
    pageSize?: number,
  ): Promise<Map<number, T>> {
    let query = this.createQueryBuilder();

    if (!!ids) {
      if(typeof ids === 'number') {
        query = query.whereInIds([ids]);
      } else {
        query = query.whereInIds(ids);
      }
    }

    if (!!modifier) {
      query = modifier(query);
    }

    if (!!page) {
      query = this.applyPagination(query, page, pageSize);
    }

    return IndexSet(await query.getMany(), v => v.id);
  }

  /**
   * relationsToPingIds - converts PostRelations and PatchRelations to an array of ids which can then be used for stem pinging
   * @param relations - the relations to convert to an array of ids
   */
  relationsToPingIds(relations: GenericRelation[]): number[] {
    let uniquePingList = new Map<number, boolean>();
    relations.forEach(r => {
      uniquePingList.set(r.id, true);
    });
    let pingList: number[] = [];
    uniquePingList.forEach((v, i) => pingList.push(i));
    return pingList;
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
}
