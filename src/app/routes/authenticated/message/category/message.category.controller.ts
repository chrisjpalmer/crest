/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  AuthController,
  GenericController,
  InjectRepo,
  PrivilegeHas,
  CoreRequest,
  promiseArray,
  PatchRelationApply,
  SyncListOutput,
  SyncDataOutput,
  GenericGetMode,
  SyncHash,
  ConfigService,
} from 'core';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Get, Body, Post, Patch, Request, Delete } from '@nestjs/common';
import {
  GetInput,
  PatchInput,
  PostInput,
  PostOutput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
} from './message.category.input';
import { MessageCategory, MessageCategoryToken } from 'database';
import { MessageCategoryService } from './message.category.service';
import { Message } from 'database';

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController(
  'message/category',
) /* http://localhost:3000/authenticated/message/category */
export class MessageCategoryController extends GenericController<
  MessageCategory
> {
  constructor(
    configService: ConfigService,
    @InjectRepo(MessageCategoryToken)
    private readonly messageCategoryRepository: Repository<MessageCategory>,
    private readonly messageCategoryService: MessageCategoryService,
  ) {
    super(configService);
  }

  /**
   * Get() - MessageCategory -> queries the messageCategory table
   * @param input
   */
  @Get()
  @PrivilegeHas(`messageCategory.get`)
  async Get(@Body() input: GetInput): Promise<SyncListOutput | SyncDataOutput> {
    //This class inherits GenericGetController. We call handleGet() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleGet(input);
  }

  /**
   * handleList - MessageCategory -> return array of hashes for the result set.
   * @param input
   */
  async handleList(input: GetInput) {
    let query = this.messageCategoryService
      .createQueryBuilder()
      .select('id', 'updateAt');

    /**
     * Apply Conditions to the query
     */
    switch (input.mode) {
      case GenericGetMode.All:
        //GenericGetMode.All -> get all rows, apply no condition
        break;
      case GenericGetMode.Discrete:
        //GenericGetMode.Discrete -> get only specific ids
        query = this.messageCategoryService.applyCondition(query, input.ids);
        break;
      case GenericGetMode.ParameterSearch:
        //GenericGetMode.ParameterSearch -> get rows which match the search parameters
        query = this.messageCategoryService.applyCondition(query, s => {
          return s.where(input.parameterSearch);
        });
        break;
    }

    /**
     * Apply Pagination to the query
     * in some cases where the dataset is so large, you may want to deny access to the service
     * unless pagination parameters are provided.
     */
    if (!!input.page) {
      query = this.messageCategoryService.applyPagination(
        query,
        input.page,
        input.pageSize,
      );
    }

    //Perform the query, get the result set.
    let rows = await query.getMany();

    //Convert the result set to hashes and return the hashes
    let result = rows.map(v => new SyncHash(v.id, v.updatedAt));
    return result;
  }

  async handleData(ids: number[]): Promise<MessageCategory[]> {
    let query: SelectQueryBuilder<MessageCategory>;
    query = this.messageCategoryService.createQueryBuilder();
    //query = query.select('mycolumn1', 'mycolumn2'); //Override which columns of the table are returned here, otherwise all are returned.
    query = this.messageCategoryService.applyStems(query);
    return await query.getMany();
  }

  /**
   * Post() - MessageCategory -> creates new messageCategory(s)
   * 1) convert - convert entries to entities that contain all the data they require
   * 2) save - save the entities in the database.
   * @param input
   */
  @Post()
  @PrivilegeHas(`messageCategory.post`)
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    //1) Prepare to create new rows in specified table by converting entries => entities
    let entities = input.entries.map(v => {
      let o: MessageCategory = this.messageCategoryRepository.create();

      o.name = v.name;

      if (!!v.messages) {
        o.messages = v.messages.map(dc => <Message>{ id: dc.id });
      }

      return o;
    });

    //2) Save all rows
    await this.messageCategoryRepository.save(entities);

    //Return result
    return { result: entities.map(v => v.id) };
  }

  /**
   * Patch() - MessageCategory -> updates messageCategory(s)
   * 1) convert - convert entries to entities with only their id, for phase 2
   * 2) find - find the entites
   * 3) apply - apply the changes from the entries to the entites
   * 4) save - save the entities
   * @param input
   */
  @Patch()
  @PrivilegeHas(`messageCategory.patch`)
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    //1) Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <MessageCategory>{ id: v.id });

    //2) For each entry, find the row it pertains to.
    let toApply: MessageCategory[] = await promiseArray(
      toFind.map(v => this.messageCategoryService.findById(v.id)), //We use messageCategory service so that we can retrieve the subobject structure...
    );

    //3) For each entry, apply the update from the input parameters
    let toSave = toApply.map((v, i) => {
      //duplicate the input value v to o. o stands for output
      let o = this.messageCategoryRepository.create(v);

      //Apply update to the property
      if (!!input.entries[i].name) {
        o.name = input.entries[i].name;
      }

      //Apply update to relationship
      if (!!input.entries[i].messages) {
        o.messages = PatchRelationApply(
          v.id,
          v.messages,
          input.entries[i].messages,
        );
      }

      return o;
    });

    //4) Save all entries at once - all effects from above routine are saved in this line
    await this.messageCategoryRepository.save(toSave);

    //Return result
    return { result: toSave.map(v => v.id) };
  }

  /**
   * Delete() - MessageCategory -> deletes messageCategory(s)
   * @param input
   */
  @Delete()
  @PrivilegeHas(`messageCategory.delete`)
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    //Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <MessageCategory>{ id: v.id });

    //For each entry, find the row it pertains to.
    let toDelete: MessageCategory[] = await promiseArray(
      toFind.map(v => this.messageCategoryRepository.findOne(v)),
    );

    //All entries found... convert to an easier format for deletion
    let deleteIDs = toDelete.map(v => v.id);

    //Delete all entries at once
    await this.messageCategoryRepository.delete(deleteIDs);

    //Return result
    return { result: deleteIDs };
  }
}
