# Crest
**Crest = CRUD + REST + Nest**

A rich starter for Nest and MySQL which makes building a web server fun again.

## Oh CRUD!
In web applications, CRUD is the implementation of **C**reate, **R**ead, **U**pdate and **D**elete operations to manipulate database tables / entities. Applications these days scale fast and CRUD will require you to repeat a lot of code... CRUD!

A solution may be to create a *general CRUD API* for all tables in your application BUT doing so creates unhealthy abstraction from the base framework. For anything requiring custom logic, extra features have to built into your generic layer.

A hybrid approach is required to balance code generalization and duplication. Crest is a starter project which will help you do this. Crest provides ***"up"*** a dev tool which transforms your database definitions into standard CRUD classes which you can then hack. That way you can always work with the frameworks you love.

Crest creates standard CRUD APIs with the following features:
* Syncing & Pagination _(for the 'R' in CRUD)_
* Roles & Privileges Auth
* JWT Auth
* Input Validation
* Logging
* Config File
* API Tester
* Debug Support (VSCode at the moment)
* Dockerization (coming soon)
* Tests (coming soon)


## Getting Started
### Prepare
Get the npm packages
```bash
cd projdir #Or open the command console in VS Code
npm install
```

### MySQL
1. Boot up a MySQL Server
2. update `config.json` with your database settings

### Up
Create the demo APIs
```bash
cd projdir #Or open the command console in VS Code
npm run up Message
npm run up MessageCategory
```

### Run
```bash
cd projdir #Or open the command console in VS Code
npm run start
```
### Test
Crest supports a test system which allows you to send json payloads to the web server.
The payloads are located under the `src/tester` folder and are organized according to the resource path.

Try these commands to get going as a root user:
```bash
curl -X POST http://localhost:3000/init
npm run login root.post myuser #Login as "root" user, save auth as "myuser"
npm run use message/create.post myuser #POST message/create.post as "myuser"
``` 

### Debugging
Debugging works out of the box for Visual Studio Code. Hit the green button to start!


# Project Structure

There are 3 main folders in the Crest starter:
```
src/app => Controllers to handle routes
src/core => A tiny boilerplate
src/database => Database entities (tables)
```
You will mostly interact with `src/app` and `src/database`.

## Using Up
### Create Tables
To create the *MessageCategory* table for the first time (this step was done for you):
```
npm run up create MessageCategory
```
This creates a new file called `message.category.entity.ts` inside the `src/database/app/` directory. The file will contain a single class which is the [TypeORM](https://github.com/typeorm/typeorm) entity for the table. You can now hack this class, adding columns, indexes to your heart's content:
```ts
@Entity()
export class MessageCategory extends GenericEntity {
  @Index({ unique: true })
  @Column({ length: 200 })
  name: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //Add your relationships here...
}
```

### Create APIs
You have customized the entity and now want to generate an API:
```bash
cd projdir #Or open the command console in VS Code
npm run up Message
npm run up MessageCategory
```

This should generate two new folders under the `src/routes/authenticated` folders:
```
message/
        message.controller.ts
        message.service.ts
        message.class.ts
        category/
                  message.category.controller.ts
                  message.category.service.ts
                  message.category.class.ts
```

# Generated Service
*Up* generates a service class with convenience methods for handling the entity.

`MessageCategoryService` inherits from `GenericEntityService` which accepts two arguments to its constructor: `mainTableAlias`, `nameColumn`. 
`src/app/routes/authenticated/message/category/message.category.service.ts`:
```ts
@Component()
export class MessageCategoryService extends GenericEntityService<
  MessageCategory
> {
  constructor(
    @InjectRepo(MessageCategoryToken)
    private readonly messageCategoryRepository: Repository<MessageCategory>,
  ) {
    super('messageCategory', 'name');
  }
```
`mainTableAlias` is the entity name in camelcase, `nameColumn` is the name of the first unique field in the entity.
```ts
class GenericEntityService {
  constructor(protected mainTableAlias: string, protected nameColumn?: string) {}
}
```

*up*'s generated `MessageCategoryService` offers three main convenience methods.

```ts
  createQueryBuilder() {
    return this.messageCategoryRepository.createQueryBuilder(this.mainTableAlias);
  }

  applyStems(
    query: SelectQueryBuilder<MessageCategory>,
  ): SelectQueryBuilder<MessageCategory> {
    return query
      .leftJoin(this.mainTableAlias + '.messages', 'message')
      .addSelect('message.id');
  }

  fillWithMessages(
    messageCategory:
      | MessageCategory
      | MessageCategory[]
      | Map<number, MessageCategory>,
    indexedMessages: Map<number, Message>,
  ) {
    StitchSet(
      messageCategory,
      indexedMessages,
      p => p.messages.map(c => c.id),
      (p, c) => (p.messages = c),
    );
  }
```
- `createQueryBuilder()` returns a new `SelectQueryBuilder` object from the `messageCategoryRepository` which can be used to create a select query on the table. The point of supplying `this.mainTableAlias` is to standardize the table alias for all queries on the table.
- `applyStems` adds the stem columns to the table. Stems are part of the `tree-stem` model which Crest uses.
- `fillWithX` methods are also part of the `tree-stem` model. The `fillWithMessages` method allows `MessageCategory` instances to be populated with `Message` instances by observing the `stems` of each `MessageCategory` instance.

## Tree-stem
`tree-stem` model imagines that a table is like a tree and a row is like a branch of that tree. Relationships between rows/branches of different trees are faciliated by a referential id column - which is called a `stem`.

If I need to inspect branch `a` of table `A`, I would observe `a` and any of its related branches. I may do this by performing an inner join between table `A` and another table. TypeORM can do this for us and will assemble the result set as an array of `A` objects that contain sub-objects for the relations. If the application client requests rows of table `A`, the typical solution is to return this array in JSON form.

```ts
let result = await this.messageCategoryRepository
  .createQueryBuilder('messageCategory')                      //selects `messageCategory.*` columns
  .innerJoinAndSelect('messageCategory.message', 'message')   //selects `message.*` columns
  .getMany();
return JSON.stringify(result); //Nest would do this automatically...
```

This is an adequate approach BUT is inefficient when many relationships are the same. A lot repeated data will be sent back to the client making the payload very large. You also must consider the payload over the database's TCP connection to the application server.

If table `A` is related to table `B` for example, the problem is elliminated by pulling data in two steps: 
1. Pull `A` rows and its `stems` ie. referential id columns
2. Pull `B` rows.

```ts
//Context 1
let result1 = await this.messageCategoryRepository
  .createQueryBuilder('messageCategory')                    //selects `messageCategory.*` columns
  .innerJoin('messageCategory.message', 'message')          
  .addSelect('message.id')                                  //selects `message.id` columns
  .getMany();
return JSON.stringify(result1); //Nest would do this automatically...

//Context 2
let result2 = await this.messageRepository
  .createQueryBuilder('message')                            //selects `message.*` columns
  .getMany();
return JSON.stringify(result2); //Nest would do this automatically...
```

This approach is called `tree-stem` because the first step downloads the `tree` and its `stems`.
It is the preferred approach for downloading data in Crest.


# Generated Controller 
## Constructor
`src/app/routes/authenticated/message/category/message.controller.ts`:
```ts
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
    @InjectRepo(MessageCategoryToken)
    private readonly messageCategoryRepository: Repository<MessageCategory>,
    private readonly messageCategoryService: MessageCategoryService,
  ) {
    super(messageCategoryService);
  }
```
*up* creates the controller class called `MessageCategoryController`. It extends super class `GenericController` (which we'll talk about later).

The decorator `@AuthController('message/controller')` sets the controller route to `http://localhost:3000/authenticated/message/category`.

### @AuthController()

`src/core/auth/auth.class.ts`:
```ts
export const AuthPrefix = 'authenticated';
export const AuthController = (prefix?: string) =>
  Controller(`${AuthPrefix}/${prefix}`);
```
`@AuthController()` is just an abstraction of Nest's `@Controller()` decorator

## Request Handlers
* The fact that the **handler** is called "Post" or "Get" means nothing. Nest decorators such as `@Post()` or `@Get()` correctly it with the request method.
* Each **handler** accepts two arguments
  * `input`: deserilized JSON body from HTTP request
  * `req` express js request object. `req.user` refers the to the logged in user.
* Crest by default allows a user to have one `role`. A `role` has many `privileges`. 
  * The `@PrivilegeHas()` method checks if the authenticated user has the privilege specified.
  * The `root` privilege allows access to everything.


## POST
`src/app/routes/authenticated/message/category/message.controller.ts`:
```ts
  /**
   * Post() - MessageCategory -> creates new messageCategory(s)
   * 1) convert - convert entries to entities that contain all the data they require
   * 2) save - save the entities in the database.
   * @param input
   */
  @Post()
  @PrivilegeHas(`message.category.post`)
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
```
An HTTP request of `POST authenticated/message/category` will trigger the `Post()` method. The `Post()` method should create new rows in the `MessageCategory` table. 
It takes an input of `PostInput` which contains a `PostInputMessageCategory[]` for creating multiple MessageCategories. This class resembles the entity class.

`src/database/app/message.category.entity.ts`
```ts
@Entity()
export class MessageCategory extends GenericEntity {
  @Index({ unique: true })
  @Column({ length: 200 })
  name: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //Message
  @ManyToMany(type => Message, message => message.categories)
  @JoinTable()
  messages: Message[];
}
```

`src/app/routes/message/category/message.category.class.ts`
```ts
export class PostInputMessageCategory {
  @IsString() name: string;

  //---------Relationships--------\\
  @ValidateNested()
  @Type(() => PostRelation)
  @IsArray()
  @IsOptional()
  messages: PostRelation[];
}
```
## Patch
`src/app/routes/authenticated/message/category/message.controller.ts`:
```ts

  /**
   * Patch() - MessageCategory -> updates messageCategory(s)
   * 1) convert - convert entries to entities with only their id, for phase 2
   * 2) find - find the entites
   * 3) apply - apply the changes from the entries to the entites
   * 4) save - save the entities
   * @param input
   */
  @Patch()
  @PrivilegeHas(`message.category.patch`)
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
```
An HTTP request of `PATCH authenticated/message/category` will trigger the `Patch()` method. The `Patch()` method should update existing rows in the `MessageCategory` table. 
It takes an input of `PatchInput` which contains a `PatchInputMessageCategory[]` for updating multiple MessageCategories. This class resembles the entity class.

`src/database/app/message.category.entity.ts`
```ts
@Entity()
export class MessageCategory extends GenericEntity {
  @Index({ unique: true })
  @Column({ length: 200 })
  name: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //Message
  @ManyToMany(type => Message, message => message.categories)
  @JoinTable()
  messages: Message[];
}
```

`src/app/routes/message/category/message.category.class.ts`
```ts
export class PostInputMessageCategory {
  @IsString() name: string;

  //---------Relationships--------\\
  @ValidateNested()
  @Type(() => PostRelation)
  @IsArray()
  @IsOptional()
  messages: PostRelation[];
}
```


## Delete
`src/app/routes/authenticated/message/category/message.controller.ts`:
```ts
  /**
   * Delete() - MessageCategory -> deletes messageCategory(s)
   * @param input
   */
  @Delete()
  @PrivilegeHas(`message.category.delete`)
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

```
An HTTP request of `DELETE authenticated/message/category` will trigger the `Delete()` method. The `Delete()` method should delete existing rows in the `MessageCategory` table. 
It takes an input of `DeleteInput` which contains a `number[]` for deleting multiple MessageCategories. 


## Get
An HTTP request of `GET authenticated/message/category` will trigger the `Get()` method. The `Get()` method should retrieve existing rows from the `MessageCategory` table. 
It takes an input of `GetInput` which inherits from `SyncInput` and contains its own parameters for limiting the result set.

By default, `GET` uses crest's two-phase syncing protocol to return the result set. The purpose is to make data transfer as efficient as possible.

### Phase 1
1. Client wants the list of message categories.
2. Client calls `GET authenticated/message/category` with `input.sync.mode == List`
3. **Server** returns the ordered result set
  - where each item is not the actual item but a hash of the `id` + `updatedAt` column
  - `hashes` property shows the plain hashed result set - for debug-ability
  - `validation` contains the hashed result set as the payload of a signed JWT token - for authenticated use
```json
{
  "hashes": [
    {"hash": 2349034334, "id":1},
    {"hash": 5645645445, "id":3}
  ],
  "validation": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```
4. Client iterates through the returned hashes:
  1. Do I have a MessageCategory of id 1?
  2. Does it have the same hash?
If the answer to any of these is 'no', then mark this id for full download.

### Phase 2
1. Client wants to download any `MessageCategory`s that were marked in *Phase 1*
2. Client calls `GET authenticated/message/category` with 
  1. `input.sync.mode == Data`
  2. `input.sync.ids = [...1,3] //marked ids`
  3. `input.sync.validation = "eyJhbGciOiJIUzI1NiIsIn..."`
4. Server checks signature of the validation JWT token
5. Server checks each id in `inpuy.sync.ids` is in the payload of the validation JWT token.
6. **Server** returns data in the format:
```json
{
  "data": {
    "1": {"id": 1, "name":"General"},
    "3": {"id": 3, "name":"Sprint Planning"}
    }
}
```
7. Client downloads data
8. Client updates its *Object Cache*
9. Client assembles the ordered result set from the information in *Phase 1* AND its *Object Cache*

### How is this implemented?
The `Get()` method immediately passes control to its super class (`GenericController`) via the method `handleGet()`.
```ts
  @Get()
  @PrivilegeHas(`message.category.get`)
  async Get(
    @Body() input: GetInput,
    @Request() req: CoreRequest,
  ): Promise<SyncListOutput | SyncDataOutput> {
    //This class inherits GenericController. We call handleGet() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleGet(input);
  }
```

The purpose pf `handleGet()` method is to check `input.sync.mode` and execute the right function.

`/src/core/controller/generic.controller.ts`:
```ts
  async handleGet(input: SyncInput): Promise<SyncListOutput | SyncDataOutput> {
    if (input.sync.mode == SyncMode.List) {
      return this._handleList(input);
    }

    return this._handleData(input.sync);
  }
```

In Phase 1 of a Sync, `MessageCategoryController.handleList()` returns an ordered `SyncHash[]`, representing the signature of the result set. The specific set of data returned can be altered depending on the input parameters. *Up* generates `input.mode` for some different ways to query the database. *Up* generates `input.page` and `input.pageSize` for applying pagination to the result set.

Under the hood `GenericController` packages the `SyncHash[]` into a JWT token and signs it with the server's key. This means that the client can only download (Phase 2) the ids which you authorize here. This may help in situations where the logged in user should not be able to see the entire result set.

```ts
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
```

In Phase 2 of a Sync, `MessageCategoryController.handleData()` returns rows which the client has requested for download. *Up* generates a `handleData()` method which applies the stems to the result set. If only a certain columns of data should be returned, you can override this behaviour here as well.

```ts
async handleData(ids: number[]): Promise<MessageCategory[]> {
    let query: SelectQueryBuilder<MessageCategory>;
    query = this.messageCategoryService.createQueryBuilder();
    //query = query.select('mycolumn1', 'mycolumn2'); //Override which columns of the table are returned here, otherwise all are returned.
    query = this.messageCategoryService.applyStems(query);
    return await query.getMany();
  }
```
