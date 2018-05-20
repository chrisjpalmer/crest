/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import {
  AuthController,
  GenericGetController,
  InjectRepo,
  PrivilegeHas,
  GenericGetInput,
  GenericGetOutput,
  CoreRequest,
  promiseArray,
  PatchRelationApply,
} from 'core';
import { Repository } from 'typeorm';
import { Get, Body, Post, Patch, Request, Delete } from '@nestjs/common';
import {
  PatchInput,
  PostInput,
  PostOutput,
  PatchOutput,
  DeleteInput,
  DeleteOutput,
} from './${entity.filename}.input';
import { ${entity.upper}, ${entity.upper}Token } from 'database';
import { ${entity.upper}Service } from './${entity.filename}.service';
/// < entity.imports.template >

//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController('${controllerPath}') /* http://localhost:3000/authenticated/${controllerPath} */
export class ${entity.upper}Controller extends GenericGetController<${entity.upper}> {
  constructor(
    @InjectRepo(${entity.upper}Token)
    private readonly ${entity.lower}Repository: Repository<${entity.upper}>,
    private readonly ${entity.lower}Service: ${entity.upper}Service,
  ) {
    super(${entity.lower}Service);
  }

  /**
   * Get() - ${entity.upper} -> queries the ${entity.lower} table
   * @param input
   */
  @Get()
  @PrivilegeHas(`${entity.lower}.get`)
  async Get(
    @Body() input: GenericGetInput,
  ): Promise<GenericGetOutput<${entity.upper}>> {
    //This class inherits GenericGetController. We call handleGet() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleGet(input);
  }

  /**
   * Post() - ${entity.upper} -> creates new ${entity.lowerPlural}
   * 1) convert - convert entries to entities that contain all the data they require
   * 2) save - save the entities in the database.
   * @param input
   */
  @Post()
  @PrivilegeHas(`${entity.lower}.post`)
  async Post(
    @Body() input: PostInput,
    @Request() req: CoreRequest,
  ): Promise<PostOutput> {
    //1) Prepare to create new rows in specified table by converting entries => entities
    let entities = input.entries.map(v => {
        let o: ${entity.upper} = this.${entity.lower}Repository.create();

        /// < entity.controller.post.field.template >

        /// < entity.controller.post.relation.template >
        return o;
      });

    //2) Save all rows
    await this.${entity.lower}Repository.save(entities);

    //Return result
    return { result: entities.map(v => v.id) };
  }

  /**
   * Patch() - ${entity.upper} -> updates ${entity.lowerPlural}
   * 1) convert - convert entries to entities with only their id, for phase 2
   * 2) find - find the entites
   * 3) apply - apply the changes from the entries to the entites
   * 4) save - save the entities
   * @param input
   */
  @Patch()
  @PrivilegeHas(`${entity.lower}.patch`)
  async Patch(
    @Body() input: PatchInput,
    @Request() req: CoreRequest,
  ): Promise<PatchOutput> {
    //1) Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <${entity.upper}>{ id: v.id });

    //2) For each entry, find the row it pertains to.
    let toApply: ${entity.upper}[] = await promiseArray(
      toFind.map(v => this.${entity.lower}Service.findById(v.id)), //We use ${entity.lower} service so that we can retrieve the subobject structure...
    );

    //3) For each entry, apply the update from the input parameters
    let toSave = toApply.map((v, i) => {
      //duplicate the input value v to o. o stands for output
      let o = this.${entity.lower}Repository.create(v);

      /// < entity.controller.patch.field.template >

      /// < entity.controller.patch.relation.template >

      return o;
    });

    //4) Save all entries at once - all effects from above routine are saved in this line
    await this.${entity.lower}Repository.save(toSave);

    //Return result
    return { result: toSave.map(v => v.id) };
  }

  /**
   * Delete() - ${entity.upper} -> deletes ${entity.lowerPlural}
   * @param input
   */
  @Delete()
  @PrivilegeHas(`${entity.lower}.delete`)
  async Delete(
    @Body() input: DeleteInput,
    @Request() req: CoreRequest,
  ): Promise<DeleteOutput> {
    //Prepare to find all rows in specified table by converting entries => entities
    let toFind = input.entries.map(v => <${entity.upper}>{ id: v.id });

    //For each entry, find the row it pertains to.
    let toDelete: ${entity.upper}[] = await promiseArray(
      toFind.map(v => this.${entity.lower}Repository.findOne(v)),
    );

    //All entries found... convert to an easier format for deletion
    let deleteIDs = toDelete.map(v => v.id);

    //Delete all entries at once
    await this.${entity.lower}Repository.delete(deleteIDs);

    //Return result
    return { result: deleteIDs };
  }
}
