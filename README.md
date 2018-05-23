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
npm run up --create MessageCategory
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
        message.input.ts
        category/
                  message.category.controller.ts
                  message.category.service.ts
                  message.category.input.ts
```


# controller.ts
## Controller Definition
`src/app/routes/authenticated/message/category/message.controller.ts`:
```ts
//------------------------------------------------
//------------------- CONTROLLER -----------------
//------------------------------------------------
@AuthController(
  'message/category',
) /* http://localhost:3000/authenticated/message/category */
export class MessageCategoryController extends GenericGetController<
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
*up* creates the controller class called `MessageCategoryController`. It extends super class `GenericGetController` (which we'll talk about later).

The decorator `@AuthController('message/controller')` sets the controller route to `http://localhost:3000/authenticated/message/category`.

### @AuthController()

`src/core/auth/auth.class.ts`:
```ts
export const AuthPrefix = 'authenticated';
export const AuthController = (prefix?: string) =>
  Controller(`${AuthPrefix}/${prefix}`);
```
`@AuthController()` is just an abstraction of Nest's `@Controller()` decorator


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
When a *POST* request with URI `authenticated/message/category/` comes to the server, the controller deserializes the JSON body into the `input` parameter. The `Post()` function reads the `input.entries` array and converts them to an array of TypeORM entities of type `MessageCategory`. It then saves these using the `messageCategoryRepository` service class so that the new data is created in the database.

A few features to point out:
* The fact that the method is called "Post" means nothing. The `@Post()` decorator tells Nest that this is the Post handler.
* `@PrivilegeHas()` works with Crest's privileges and roles system. Any user accessing this method must have the privilege `message.category.post` or `root`
* `@Body()` decorator makes Nest inject the request body into the parameter `input`. Validation also occurs so that an error is thrown if the input does not adhere to `PostInput` typescript class.
* `PostInput` is defined in `./message.category.input.ts`
* Although `req` object is not used, for ease it is injected here as well. You can access the normal express request object properties, as well as the `req.user` property for examining the user who initiated the request.
* The return value of the handler is `Promise<PostOutput>` which is defined in `./message.category.input.ts`

The job of the *Post* handler is to create new data. It takes an input of `PostInput` which contains an array of `PostInputMessageCategory`. This class resembles `MessageCategory`:

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

`src/app/routes/message/category/message.category.input.ts`
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
When a *PATCH* request with URI `authenticated/message/category/` comes to the server, the controller deserializes the JSON body into the `input` parameter. The `Patch()` function reads the `input.entries` array and fetches the target rows from the database. It reads each entry and if a field is not undefined, it applies an update to the entity. It then saves all the entities using the `messageCategoryRepository` service class.

A few features to point out:
* The fact that the method is called "Patch" means nothing. The `@Patch()` decorator tells Nest that this is the Patch handler.
* `@PrivilegeHas()` works with Crest's privileges and roles system. Any user accessing this method must have the privilege `message.category.patch` or `root`
* `@Body()` decorator makes Nest inject the request body into the parameter `input`. Validation also occurs so that an error is thrown if the input does not adhere to `PatchInput` typescript class.
* `PatchInput` is defined in `./message.category.input.ts`
* Although `req` object is not used, for ease it is injected here as well. You can access the normal express request object properties, as well as the `req.user` property for examining the user who initiated the request.
* The return value of the handler is `Promise<PatchOutput>` which is defined in `./message.category.input.ts`

The job of the *Patch* handler is to update existing data. It takes an input of `PatchInput` which contains an array of `PatchInputMessageCategory`. This class resembles `MessageCategory`:

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

`src/app/routes/message/category/message.category.input.ts`
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
When a *DELETE* request with URI `authenticated/message/category/` comes to the server, the controller deserializes the JSON body into the `input` parameter. The `Delete()` function reads the `input.entries` array and fetches the target rows from the database. It reads each entry and if a field is not undefined, it applies an update to the entity. It then saves all the entities using the `messageCategoryRepository` service class.

A few features to point out:
* The fact that the method is called "Delete" means nothing. The `@Delete()` decorator tells Nest that this is the Delete handler.
* `@PrivilegeHas()` works with Crest's privileges and roles system. Any user accessing this method must have the privilege `message.category.delete` or `root`
* `@Body()` decorator makes Nest inject the request body into the parameter `input`. Validation also occurs so that an error is thrown if the input does not adhere to `DeleteInput` typescript class.
* `DeleteInput` is defined in `./message.category.input.ts`
* Although `req` object is not used, for ease it is injected here as well. You can access the normal express request object properties, as well as the `req.user` property for examining the user who initiated the request.
* The return value of the handler is `Promise<DeleteOutput>` which is defined in `./message.category.input.ts`

The job of the *Delete* handler is to update existing data. It takes an input of `DeleteInput` which contains an `number[]` of ids to delete.



## Get
When a *GET* request with URI `authenticated/message/category/` comes to the server, the controller deserializes the JSON body into the `input` parameter. The `Get()` function passes control to its super class `GenericGetController` which handles 2 phase syncing protocol. The data returned from this function is sent to the output.

Crest implements an opinionated syncing protocol with two phases:

### Phase 1
1. Client wants the list of message categories.
2. Client calls `http://localhost:3000/authenticated/message/category` with `input.sync.mode == List`
3. **Server** returns the result set BUT all items are hashed by their `updatedAt` timestamp:
```json
{
  "1": {"hash": 2349034334, "id":1},
  "3": {"hash": 5645645445, "id":3},
}
```
4. Client iterates through the returned hashes:
  1. Do I have a MessageCategory of id 1?
  2. Does it have the same hash?
If the answer to any of these is 'no', then mark this item for full download.

### Phase 2
1. Client wants to download any `MessageCategory`s that were marked in *Phase 1*
2. Client calls `http://localhost:3000/authenticated/message/category` with 
  1. `input.sync.mode == Data`
  2. `input.sync.ids = [...1,3] //marked ids`
3. **Server** returns data in the format:
```json
{
  "1": {"id": 1, "name":"General"},
  "3": {"id": 3, "name":"Sprint Planning"},
}
```
4. Client downloads data
5. Client updates its *Object Cache*
6. Client assembles the ordered result set from the information in *Phase 1* AND its *Object Cache*

### How is this implemented?
The `Get()` method immediately passes control to its super class (`GenericGetController`) via the method `handleGet()`.
```ts
  async Get(
    @Body() input: GenericGetInput,
  ): Promise<GenericGetOutput<MessageCategory>> {
    //This class inherits GenericGetController. We call handleGet() on this controller
    //to handle the request. This pattern can be overidden where custom functions are required
    return await this.handleGet(input);
  }
```

Let's take a look at how `handleGet()` is defined in `/src/core/request/get.ts`:
```ts
  private async handleGet(input: GenericGetInput): Promise<SyncResponse<T>> {
    //SyncMode == List
    if (input.sync.mode == SyncMode.List) {
      return await this.handleList(input);
    }
    //SyncMode == Data
    return await this.handleData(input.sync);
  }
```

The only mission of `handleGet()` method is to find the syncing mode. it checks `input.sync.mode` and passes control to the relevant function.

```ts
protected async handleList(input: GenericGetInput): Promise<SyncHash> {
    let result: Promise<SyncHash>;
    switch (input.mode) {
      case GenericGetMode.All:
        result = this.dataService.findSyncHash(
          null,
          input.page,
          input.pageSize,
        );
        break;
      case GenericGetMode.Discrete:
        await validateInput(Discrete);
        result = this.dataService.findSyncHash(
          input.ids,
          input.page,
          input.pageSize,
        );
        break;
      case GenericGetMode.ParameterSearch:
        await validateInput(ParameterSearch);
        result = this.dataService.findSyncHash(
          s => {
            return s.where(input.parameterSearch);
          },
          input.page,
          input.pageSize,
        );
        break;
    }
    return result;
  }

```