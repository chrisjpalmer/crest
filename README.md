# Crest
## Getting Started
**Crest = CRUD + REST + [Nest](https://nestjs.com)**

Build your first web server in 20 minutes!

[![Build a web server in 20 minutes](https://img.youtube.com/vi/iLbd17jzQjE/0.jpg)](https://www.youtube.com/watch?v=iLbd17jzQjE)

Tutorial Page - https://github.com/chrisjpalmer/book-shelf-app-starter

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
* [API Client Generator](https://github.com/chrisjpalmer/crest-client)
* Dockerization
* Debug Support (VSCode at the moment)
* Tests (coming soon)

# Crest Commands

### Prerequisites
1. Git
2. Node 8.9 or Higher
3. Python 2.7 - required to install bcrypt node dependency

### Init
```bash
npm install
npm run init
#set config/config.json with your database settings
```

### Create a table
```
npm run up create Book
npm run up create Genre
```

### Build an API
```bash
npm run up Book
npm run up Genre
```

### Run
```bash
npm run start
npm run start:prod
```

### Docker
```bash
docker build -t my-crest-image .
docker run -v /path/to/config.json:/config.json my-crest-image
```

### Debug
Debugging works out of the box for Visual Studio Code. Hit the green button to start!

### API Client
Crest's little brother is [crest-client](https://github.com/chrisjpalmer/crest-client) which can help you spin up an API Client in no time.

Just clone the project and point it to your project.

```bash
git clone https://github.com/chrisjpalmer/crest-client && cd crest-client

npm install
npm run init
npm run down "path/on/my/drive/to/crest"
```
*For more information see the [crest-client](https://github.com/chrisjpalmer/crest-client) page*

# Use 'Up'
`up` has two functions.
1. help create [TypeORM](https://github.com/typeorm/typeorm) entities / tables
2. convert those [TypeORM](https://github.com/typeorm/typeorm) entities / tables into APIs.

### Create Tables
To create a table, specify *create* after the `up` command:
```bash
npm run up create Genre
```

This creates `genre.entity.ts` inside the `src/database/app/` directory. The file will contain a new [TypeORM](https://github.com/typeorm/typeorm) entity which represents the `genre` MySQL table. You can now customize it with fields and relationships.
```ts
@Entity()
export class Genre extends GenericEntity {
  @Index({ unique: true })
  @Column({ length: 200 })
  name: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  //Add your relationships here...
}
```

It is important that you always specify the name of the table in PascalCase. `up` namespaces your APIs using PascalCase:
```
Genre => /genre
BookGenre => /book/genre
```


### Create APIs
To generate an API we simply run `up` and pass the table name.
```bash
npm run up Genre
```

This should generate two new folders under the `src/routes/authenticated` folders:
```
genre/
        genre.controller.ts
        genre.service.ts
        genre.class.ts
```

# Generated API
Imagine we ran `up` on an entity like this:
```ts
@Entity()
export class Genre extends GenericEntity {
  @Index({ unique: true })
  @Column({ length: 200 })
  name: string;

  //-------------------------------------
  //-------------Relationships-----------
  //-------------------------------------

  @ManyToMany(type => Book, book => book.genres)
  books:Book[];
}
```
...what would our API look like?

`up` generates *GET*, *POST*, *PATCH* and *DELETE* methods for *READ*, *CREATE*, *UPDATE* and *DELETE* operations:

## GET / Read
**Input Signature**
```ts
export class SyncInput {
  //Query Mode
  mode: GenericSyncMode;
  //Discrete Mode
  ids: number[];
  //ParameterSearch Mode
  parameterSearch: SyncParameterSearch;

  //Pagination
  page: number;
  pageSize: number;
}

export interface SyncParameterSearch {
  id: number;
  updatedAt: Date;
  createdAt: Date;
  name: string;
}
```

**Sample call:**

Get all genres:
```json
{
  "mode":0, //Select All
}
```

Get specific genres:
```json
{
  "mode":1, //Select Discrete
  "ids":[1, 3, 10]
}
```

Get all genres with pagination:
```json
{
  "mode":0, //Select All
  "page":2,
  "pageSize":20
}
```

## POST / Create
**Input Signature**
```ts
export class PostInput {
  entries: PostInputGenre[];
}

export class PostInputGenre {
  name: string;
  books: PostRelation[];
}
```

**Sample call:**

Create two genres. Put some books in the second genre.
```json
{
  "entries": [
    {"name":"Non-fiction"},
    {"name":"Fiction", "books": [{"id":1, "id": 7}]}
  ]
}
```

## PATCH / Update
**Input Signature**
```ts
export class PatchInput {
  entries: PatchInputGenre[];
}

export class PatchInputGenre {
  id: number;
  name: string;
  books: PatchRelation[];
}
```

**Sample call:**

Update the `"non-fiction"` genre and change its name. Add a book to it, remove a book from it.
```json
{
  "entries": [
    {
      "id":1, 
      "name":"Serious Books", 
      "books": [
        {
          "mode": 0, //Create relationship
          "id" : 5,
        },
        {
          "mode": 1, //Break relationship
          "id" : 7,
        }
      ]
    }
  ]
}
```

## DELETE / Delete
**Input Signature**
```ts
export class DeleteInput {
  entries: DeleteInputGenre[];
}

export class DeleteInputGenre {
  id: number;
}
```

**Sample call:**

Delete genres which have ids 2 and 3.
```json
{
  "entries": [
    {"id": 2},
    {"id": 3},
  ]
}
```

# Generated Code
Under the hood, `up` generates:
- [Nest](https://nestjs.com) Controller => genre.controller.ts
- Input / Output Signatures => genre.class.ts
- Service Class with Convenience Methods => genre.service.ts

If you understand a bit about [Nest](https://nestjs.com) already, the controller contains most of the logic for handling requests.
`up` generates GET, POST, PATCH and DELETE handlers inside the controller:

```ts
@Get()
  @PrivilegeHas(`genre.get`)
  async Sync(@Body() input: SyncInput, @Request() req: CoreRequest): Promise<SyncListOutput | SyncDataOutput> {

  }

  @Post()
  @PrivilegeHas(`genre.post`)
  async Post(@Body() input: PostInput, @Request() req: CoreRequest): Promise<PostOutput> {

  }

  @Patch()
  @PrivilegeHas(`genre.patch`)
  async Patch(@Body() input: PatchInput, @Request() req: CoreRequest): Promise<PatchOutput> {

  }

  @Delete()
  @PrivilegeHas(`genre.delete`)
  async Delete(@Body() input: DeleteInput, @Request() req: CoreRequest): Promise<DeleteOutput> {

  }
```

**PrivilegeHas()**

- You will notice the use of the `@PrivilegeHas()` decorator which is part of Crest's *users, roles and privileges* system. 
- `@PrivilegesHas()` ensures that this method can only be called by a privileged user.
In other words to call the GET method, the user must have the `"genre.get"` privilege.
- `"root"` is a special privilege which accesses anything.
- If you need to validate more privileges, specify them as additional arguments to the decorator.

**Input / Output**

- By default [Nest](https://nestjs.com) expects JSON input and returns JSON output.
- The input is validated and deserialized into the `input` parameter, through [Nest's](https://nestjs.com) `@Body()` decorator. 
- The output signatures for each response are located in `genre.class.ts`.

**Request Object**

- The `req` parameter is the Express JS request object. 
- [passport](http://www.passportjs.org/) is used to authenticate the user's jwt token and populates  `req.user` with the accessing user

**Get is special**

Crest implements a syncing protocol for GET. This syncing protocol has 2 phases. 
1. The api client obtains a lightweight signature of the result set, containing only *ids* and *hashes* of the database objects. 
2. The api client can selectively downloads objects whose hashes its never seen or are different to what is already has.

You can see the return type of GET is a union of `SyncListOutput` and `SyncDataOutput`, for phase 1 and 2 respectively.


# Generated Service
`up` generates a service class with convenience methods for handling the entity.

```ts
@Injectable()
export class GenreService extends GenericEntityService<Genre> {
  constructor(
    @InjectRepo(GenreToken) private readonly genreRepository: Repository<Genre>,
    @InjectRepo(BookToken) private readonly bookRepository: Repository<Book>,
  ) {
    super('genre', 'name');
  }

  /**
   * createQueryBuilder - convenience abstraction of repository.createQueryBuilder(tableAlias)
   */
  createQueryBuilder() {
    return this.genreRepository.createQueryBuilder(this.mainTableAlias);
  }

  /**
   * Fill with methods
   */

  fillWithBooks(
    genre: Genre | Genre[] | Map<number, Genre>,
    indexedBooks: Map<number, Book>,
  ) {
    StitchSet(
      genre,
      indexedBooks,
      p => p.books.map(c => c.id),
      (p, c) => (p.books = c),
    );
  }

  /**
   * Apply Stems methods
   */

  applyStemsBooks(query: SelectQueryBuilder<Genre>): SelectQueryBuilder<Genre> {
    return query
      .leftJoin(this.mainTableAlias + '.books', 'book')
      .addSelect('book.id');
  }

  /**
   * Ping Stems methods
   */

  async pingStemsBooks(entries: Entry[]): Promise<void> {
    let relations: GenericRelation[] = [];
    entries.map(v => v.books).forEach(r => {
      if (!!r) {
        relations.push(...r);
      }
    });
    let pingList = this.relationsToPingIds(relations);

    await this.bookRepository
      .createQueryBuilder('book')
      .update({ updatedAt: () => 'CURRENT_TIMESTAMP(6)' })
      .whereInIds(pingList)
      .execute();
  }
}
```

Lets look at some of these convenience methods:
- **createQueryBuilder():** an abstraction of the `repository.createQueryBuilder()` method which automatically provides the table alias argument. It passes `this.mainTableAlias` which is initialized in the constructor as `"genre"`
- **fillWithBooks():** builds on Crest's *stem* model which is explained below. Allows a bunch of hollow `genre` objects to be populated with `book` objects.
- **applyStemsBooks:** also builds on Crest's *stem* model. Performs an INNER JOIN on a[ TypeORM](https://github.com/typeorm/typeorm) query to fetch the stem columns of the `Book` table.
- **pingStemsBooks:** this method is used to change the `updatedAt` column of books which are related to any `genres` passed to the function. You may want to do this if the relationships change between some `books` and `genres`.

# Stem model
## Intro
A table will often have rows which are related to another table's rows. This link is commonly defined through *Join Tables* or *Join Columns*. In [TypeORM](https://github.com/typeorm/typeorm) we are invited to forget about the underlying mechanics of database relationships. [TypeORM](https://github.com/typeorm/typeorm) treats all related entities to a row as sub-objects of that object.

In TypeORM, if we make this query...
```ts
let messageCategories = await this.messageCategoryRepository
.createQueryBuilder('messageCategory')
.innerJoinAndSelect('messageCategory.messages', 'message')
.getMany();
```
the `MessageCategory` table and the `Message` table will be joined. [TypeORM](https://github.com/typeorm/typeorm) gives the result set as an array of `MessageCategories`. Each `MessageCategory` will contain arrays of `Messages`.

## Best Practices
ORM libraries like [TypeORM](https://github.com/typeorm/typeorm) provide developers with a neat way to access the database. However they don't always enforce the best practices. To illustrate this point, lets revist the book, genre example.

There is a finite list of `Genres` in the world but an ever growing list of `Books`. It is quite possible that a `Genre` may have many columns of information associated with it, if we got pedantic!

Perhaps we want to query the database for some books `Books` and their related `Genres`:
```ts
let books = await this.bookRepository
.createQueryBuilder('book')
.innerJoinAndSelect('book.genre', 'genres')
.getMany();
```

[TypeORM](https://github.com/typeorm/typeorm) will produce this SQL statement when talking to MySQL:
```sql
SELECT book.*, genre.* FROM book
INNER JOIN genre_book ON genre_book.book_id = book.id
INNER JOIN genre ON genre_book.genre_id = genre.id;
```

This is all well and good but what if a lot of `Books` share many of the same `Genres`. And what if the dataset of `Books` was very large? This would result in a lot of data transfer between the database, server and client.

## Introducing Stems...
An approach is required to neutralize repetitive data in the query.

Crest introduces the concept of `stems` to solve this problem. A `stem` is simply the *id column* of the related table. In our example it would be the `Genre.id` field. We could rewrite our query to only capture the `stem` of the `Genre` table:

```ts
let books = await this.bookRepository
.createQueryBuilder('book')
.innerJoin('book.genre', 'genres')  //Does not add all genre's columns
.addSelect('genres.id')             //Adds genre's id column
.getMany();
```

[TypeORM](https://github.com/typeorm/typeorm) would generate the query like this:
```sql
SELECT book.*, genre.id FROM book
INNER JOIN genre_book ON genre_book.book_id = book.id
INNER JOIN genre ON genre_book.genre_id = genre.id;
```

Though an *inner join* still has to be performed, we have minimized the `Genre` results to the smallest possible form. When [TypeORM](https://github.com/typeorm/typeorm) deserializes this into object format only the *id column* of the `Genre` sub-object will be populated.

Of course, the client still needs the `Genre` information and it may choose to make a seperate request to the application server for the complete list of `Genre`s. Alternatively if the `Genre` dataset is also very large, the request could be made for just a specific set of `Genres` which are relevant.

This concept is called `stem` model, because only the `stem` columns of related tables are fetched.

# Controller Concepts
## Routing
You may we wondering how the path of your controller is set. This is down to the  `@AuthController()` decorator.

```ts
@AuthController('genre')
export class GenreController extends SyncController<Genre> {
```
- In this example, the controller path is `/authenticated/genre`.
- Any routes under `/authenticated` require a JWT token to be present in the `Authorization` header.

## Syncing
If you use [crest-client](https://github.com/chrisjpalmer/crest), you won't need to implement *Crest Syncing Protocol*. However, if you plan on building your own client, you will need to understand how it works.

Lets imagine you want to get the complete list of `Books` from your Crest server. There may be hundereds of books in the database, many of which your application has seen before. You only want to download the ones that matter. Crest helps you by breaking your GET request into two phases:
1. Get the **LIST** of books as an array of book signatures (called `SyncHashes`)
2. Download the **DATA** for the books you don't have.

### Phase 1
To do this first bit, your API client has to make a GET request for the books and set the sync mode to **LIST**
```ts
//GET authenticated/books
{
  "sync": {
    "mode": 0 //Sync mode 1 = LIST
  }
  "mode": 0, //I want all the books
}
```

Crest handles your request by querying the `Books` table for the `id` and `updatedAt` columns. It then converts the result set to an array of `SyncHash` objects:
```ts
async handleList(input: SyncInput) {
    let query = this.genreService
      .createQueryBuilder()
      .select(this.genreService.transformColumns(['id', 'updatedAt']));
    
    ///... apply any other filters
    
    let rows = await query.getMany();
    let result = rows.map(v => new SyncHash(v.id, v.updatedAt));
    return result;
}
```

The response may look something like this:
```json
{
  "hashes": [
    {"hash": 2349034334, "id":1},
    {"hash": 5645645445, "id":3},
    {"hash": 4589534054, "id":7}
  ],
  "validation": "eyJhbGciOiJIU..."
}

```
The hash is calculated by:
```
farmhash(row.updatedAt + row.id)
```
If you update the row at a later time, its hash will be different and your client will know to redownload the row.

You may be wondering what the `validation` property is all about. This is in fact a JWT token, containing the exact same information as the `hashes` object except signed by your server's private key (see crest config: TODO). Your api client will need to send this back to the server in phase 2, as proof that the objects you want to download were authorized to you. 

### Phase 2
Your API Client will decide what objects it needs to download and make another GET request:
```json
{
  "sync": {
    "mode": 1, //Sync mode 2 = DATA
    "ids": [1, 7],
    "validation": "eyJhbGciOiJIU..."
  }
}
```

The server validates the JWT token and checks that the ids are valid. It then queries the database for those ids, this time downloading the full set of columns including any *stems*:
```ts
async handleData(ids: number[]): Promise<Partial<SyncOutput>[]> {
    let query: SelectQueryBuilder<Genre>;
    query = this.genreService.createQueryBuilder();
    query = this.genreService.applyStemsBooks(query);
    query = query.whereInIds(ids);
    return await query.getMany();
  }
```

The result set is sent back as a data map for convenient access:
```json
{
  "data": {
    "1": {"id": 1, "name": "Fiction", "books": [{"id":1}, {"id": 4}]},
    "7": {"id": 7, "name": "Biography", "books": [{"id":22}]}
    }
}
```

To complete the job, your API client will need to aggregate all the returned objects with those it has downloaded in the past. It should then refer back to the server response from Phase 1. The order of the objects is preserved here and should be used to build the output of the API request.

# Crest Config
TODO -> write nice things here.