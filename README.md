# Crest
**Crest = Classy REST + [Nest](https://nestjs.com)**

## RESTful APIs done right
Making RESTful APIs is essential for enterprise software. Even more essential, when considering scalablity, is the properness of the underlying architecture. We are through with the days of scrolling through badly named code files just to modify one part of the application! Why not have Dont-Repeat-Yourself, Single-Rule-Principle code with well defined multi-layer architecture?

Crest will help you adhere to these good practices. Under the hood Crest leverages NestJS and includes a thin boilerplate for authentication, privileges & roles and users. Crest ships with its code generation tool `up` which generates hackable templates so that you can build the components of your API. Whats more? It even has a brother project called [crest-client](https://github.com/chrisjpalmer/crest-client), which auto generates a client library for interfacing with your API and supports direct integration with AngularJS.

Crest has some features you would expect:
* Roles & Privileges Auth
* JWT Auth
* Input Validation via class-validator
* Logging
* Configuration file *read on boot*
* Debug Support through VSCode

Crest also has some experimental features which are open for community critique:
* Crest Sync
* Stem Model

Crest encourages you to write your APIs with the 4 layer pie:
* Entities - the dumb structs which hold your data
* Models - classes which map one to one ontop of your entities, providing a thin layer of business logic
* Services - service classes which handle the models layer and provide additional business logic
* Controllers - the bridge between the transport layer (HTTP) and your services, applying roles authentication and serialization of the API's input and output.

# Getting Started

### Prerequisites
1. Git
2. Node 8.9 or Higher
3. Python 2.7 - required to install bcrypt node dependency

### Gettting Started
```bash
npm install
npm run init
#set config/config.json with your database settings
```

### Create an entity
```
npm run up -- create entity Book
```

### Create an model
```
npm run up -- create model Book
```

### Create an service
```
npm run up -- create service Book
```

### Create an controller
```
npm run up -- create controller Book --route=@/book               #Create an authenticated route
npm run up -- create controller Book --route=authenticated/book   #Create an authenticated route
npm run up -- create controller Book --route=book                 #Create an unauthenticated route
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

# Boilerplate

### Routing
You may we wondering how the path of your controller is set. This is down to the `@AuthController()` and `@Controller()` decorators.

```ts
@AuthController('genre')
export class GenreController {
```
- In this example, the controller path is `/authenticated/genre`.
- Any routes under `/authenticated` require a JWT token to be present in the `Authorization` header.

### PrivilegeHas()

- You will notice the use of the `@PrivilegeHas()` decorator which is part of Crest's *users, roles and privileges* system. 
- `@PrivilegeHas()` ensures that this method can only be called by a privileged user.
- By default Crest generated a `@PrivilegeHas()` decorator for each of you controller methods. You are free to change these if you wish.
- `"root"` is a special privilege which accesses anything.
- `@PrivilegeHas()` decorator takes an array of string arguments. Each of these arguments is a privilege that the user must have to access the method.

### Input / Output

- By default [Nest](https://nestjs.com) expects JSON input and returns JSON output.
- The input is validated and deserialized into the `input` parameter, through [Nest's](https://nestjs.com) `@Body()` decorator. 
- The output signatures for each response are located in `genre.class.ts`.

### Request Object

- The `req` parameter is the Express JS request object. 
- [passport](http://www.passportjs.org/) is used to authenticate the user's jwt token and populates  `req.user` with the accessing user


# Stem model (Experimental)
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


# Crest Sync (Experimental)
If you use [crest-client](https://github.com/chrisjpalmer/crest), you won't need to implement *Crest Syncing Protocol*. However, if you plan on building your own client, you will need to understand how it works.

Lets imagine you want to get the complete list of `Books` from your Crest server. There may be hundereds of books in the database, many of which your application has seen before. You only want to download the ones that matter. Crest helps you by breaking your request into two phases:
1. Get the **LIST** of books as an array of book signatures (called `SyncHashes`)
2. Download the **DATA** for the books you don't have.

### Phase 1
To do this first bit, your API client has to make a POST request for the books and set the sync mode to **LIST**
```ts
//POST authenticated/books/sync
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

You may be wondering what the `validation` property is all about. This is in fact a JWT token, containing the exact same information as the `hashes` object except signed by your server's private key (set in config/config.json of your project). Your api client will need to send this back to the server in phase 2, as proof that the objects you want to download were authorized to you. 

### Phase 2
Your API Client will decide what objects it needs to download and make another POST request:
```json
//POST authenticated/books/sync
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