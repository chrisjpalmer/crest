# Crest
**Crest = CRUD + REST + Nest**
A rich starter for Nest and MySQL which makes building a web server fun again.

## Oh CRUD!
The CRUD design pattern typically involves the definition of related database tables for which there should exist an API. The API should include operations to **C**reate, **R**ead, **U**pdate and **D**elete records of these entities. To implement CRUD properly, the developer should rewrite similar code for each table. Its a fairly repetitive process that will leave you saying 'Oh CRUD' for a while.

One school of thought says to have a generic CRUD API. In this model, your application looks like a dumb proxy to the database. Whilst this reduces the amount of repetitive coding, the result is abstraction from the base framework. A new developer has to learn 2 things now AND any custom logic has to be implemented as part of your generic API _( = code spaghetti)_.

A hybrid approach is required where some operations are generalized BUT some code is repeated. This is where Crest comes into play. Crest has you define your database tables as TypeORM entity classes. It then provides a code generation tool (_up_) to turn these into your CRUD API layer. We don't abstract you from the frameworks you know and love.

What's more? Crest packages a bunch of handy features which every CRUD application needs:
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
Before doing anything you need to get the npm packages.
```bash
cd projdir #Or open the command console in VS Code
npm install
```

### Config
`/config.json` is the configuration file for the web server. Boot up your own MySQL server and set the credentials for the database inside this file to allow Crest to connect to your database.

### Up
```bash
cd projdir #Or open the command console in VS Code
npm run up Message
npm run up MessageCategory
```
Crest includes _up_, a Nest controller generator. Give _up_ the PascalCase name of your database entity, let Crest do the REST!

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
npm run login root.post myuser #Executes the login service and saves the JWT token in a bash key store against the key "myuser"
npm run use messages/create.post myuser #Executes the /authenticated/message POST method with the JWT token for myuser
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

## Up
If you haven't already run the following commands on your project:
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

## How does it work?
### Create Tables
As a developer you will need to create new database tables.
Up provides a way to do this:
```
npm run up -e MessageCategory
```
This creates a new file called `message.category.entity.ts` inside the `src/database/app/` directory. The file will contain a single class which is the TypeORM entity for the table:

*If you are unfamiliar with TypeORM then check out the documentation here.* You can now hack this class, adding columns, indexes to your heart's content.
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
npm run up MessageCategory
```

*up* creates:
* message.category.controller.ts
* message.category.service.ts
* message.category.input.ts
in the `/src/routes/authenticated/message/category` folder of your project.

## Controller.ts
# Controller Definition
Lets take look at the code which is generated...

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
*up* creates the controller class for us. The controller class is called `MessageCategoryController` and it extends a base class `GenericGetController` which we'll talk about later.
The class definition has a decorator `@AuthController()`. Lets have a look at the definition inside `/src/core/auth/auth.class.ts`
```ts
export const AuthPrefix = 'authenticated';
export const AuthController = (prefix?: string) =>
  Controller(`${AuthPrefix}/${prefix}`);
```
`AuthController` calls Nest's `@Controller` decorator factory but just prepends whatever route you supply with `authenticated/`

This means that to invoke a method on the controller you must use:
`http://localhost:3000/authenticated/message/category`

# POST
*up* generates a handler for Post requests.
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
A few features to point out:
* The fact that the method is called "Post" means nothing. The `@Post()` decorator tells Nest that this is the Post handler.
* `@PrivilegeHas()` works with Crest's privileges and roles system. Any user accessing this method must have the privilege `message.category.post` or `root`
* `@Body()` decorator makes Nest inject the request body into the parameter `input`. Validation also occurs so that an error is thrown if the input does not adhere to `PostInput` typescript class.
* `PostInput` is defined in `./message.category.input.ts`
* Although `req` object is not used, for ease it is injected here as well. You can access the normal express request object properties, as well as the `req.user` property for examining the user who initiated the request.
* The return value of the handler is `Promise<PostOutput>` which is defined in `./message.category.input.ts`

The job of the *Post* handler is to create new data. It takes an input of type `PostInput` which has a very similar signature the the `MessageCategory` entity.

### message.category.entity.ts
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
### message.category.input.ts
```ts
//-----------Post----------\\

//Input
export class PostInput {
  @ValidateNested()
  @Type(() => PostInputMessageCategory)
  @IsArray()
  entries: PostInputMessageCategory[];
}

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
`PostInput` accepts an array of `entries`, which are of the type `PostInputMessageCategory`.

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


### Get/Read
Although Crest aims to avoid code generalization, the only exception is `Get` to faciliate syncing and pagination of the data set. (*If the community wants to move this out of generic land, I am not opposed to this*)

Crest implements an opinionated syncing pattern with two phases:

#### Phase 1
1. Client wants the list of message categories.
2. Client calls `http://localhost:3000/authenticated/message/category` with `input.sync.mode == List`
3. **Server** returns data in the format:
```json
{
  "1": {"hash": 2349034334, "id":1},
  "3": {"hash": 5645645445, "id":3},
}
```
the data contains object signatures in the result set.
4. Client iterates through the returned object signatures:
  1. Do I have a MessageCategory of id 1?
  2. Does it have the same hash.
If the answer to any of these is 'no', then this object in the result set should be downloaded.

#### Phase 2
1. Client wants to download the MessageCategories it does not have / need updating
2. Client calls `http://localhost:3000/authenticated/message/category` with `input.sync.mode == Data`
3. **Server** returns data in the format:
```json
{
  "1": {"id": 1, "name":"General"},
  "3": {"id": 3, "name":"Sprint Planning"},
}
```
4. Client downloads data
5. Client updates its internal cache
6. Client uses the phase 1 server response to build the results set and pass it to whatever layer requires it.

#### How is this implemented in code?
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


### message.service
The route controller's job is to be a bridge between the API layer and the application services. Application services are exposed to the route handler in two ways:

1. TypeORM Repositiory Object: `messageRepository:Repository<Message>`
2. Service Class: `messageService:MessageService //extends GenericEntityService`

The TypeORM definitions are located in the `database` module of the Crest application and we will cover them later. However the service class should be defined in the route folder. This corresponds to the file `message.input`.

### message.controller.spec
Finally the file `message.controller.spec.ts` contains unit tests for the route controller.

## Route Operations
TODO: FINISH THIS
Authentication, Privileges
Get, Post, Patch, Delete

# Common Development Tasks
## Add New Table
New Entity,
New Route

## CQRS vs CRUD