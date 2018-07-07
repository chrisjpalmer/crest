/** BOILERPLATE - don't touch unless you are brave */
import { Inject } from '@nestjs/common';
import { Connection, createConnection } from 'typeorm';
import { ConfigService } from '../service/config.service';
import { FactoryProvider } from '@nestjs/common/interfaces';

function repoToken(token: string) {
  return `${token}RepositoryToken`;
}

/** This token should be used with @Inject(DbConnectionToken) private readonly connection:Connection.
 * It is the token associated with the typeORM Connection class used for NestJS dependency injection
 */
export const DbConnectionToken = 'DbConnectionToken';

/** Associates a TypeORM Entity definition with a string token, used for NestJS dependency injection */
export type EntityProvider = { token: string; type: any };

/**
 * InjectRepo wraps Inject for convenience. It should be used to Inject repository components in a NestJS application:
 * e.g. @InjectRepo(UserToken) userRepository:Repository<User>
 * Inject comes from NestJS and you can check out the use case here: https://docs.nestjs.com/techniques/sql
 * @param token
 */
export function InjectRepo(token: string) {
  return Inject(repoToken(token));
}

/**
 * MakeDatabaseProvider registers the database provider as a Nest JS component.
 * entity groups must be passed so the TypeORM can synchronize the schema ahead of time.
 * MakeDatabaseProvider(a, b). Any entity in 'b' with the same token as that of 'a', overrides 'a'
 * @param entityGroups
 */
export function MakeDatabaseProvider(
  ...entityGroups: EntityProvider[][]
): FactoryProvider {
  let totalEntities: EntityProvider[] = CompileEntities(entityGroups);
  let totalEntitiesTypes = totalEntities.map(e => e.type);

  let provider:FactoryProvider = {
    provide: DbConnectionToken,
    useFactory: async (configService: ConfigService) => {
      return await createConnection({
        type: 'mysql',
        host: configService.database.host,
        port: configService.database.port,
        username: configService.database.username,
        password: configService.database.password,
        database: configService.database.schema,
        entities: totalEntitiesTypes,
        synchronize: true,
        timezone: 'utc', //This ir pretty important. If you don't set this, the database time defaults to the local timezone. The standard is to set databases to UTC!
      });
    },
    inject: ['ConfigService'],
  };

  return provider;
}

/**
 * MakeRepositoryProviders creates repositories for each entity and register that entity as a service class / NestJS Injectable.
 * The component can then be later injected into any controller function using @InjectRepo(UserToken) userRepository:Repository<User>
 * MakeRepositoryProviders(a, b). Any entity in 'b' with the same token as that of 'a', overrides 'a'
 * @param entityGroups
 */
export function MakeRepositoryProviders(
  ...entityGroups: EntityProvider[][]
): FactoryProvider[] {
  let totalEntities: EntityProvider[] = CompileEntities(entityGroups);

  return totalEntities.map(entity => {
    let provider:FactoryProvider = {
      provide: repoToken(entity.token),
      useFactory: (connection: Connection) =>
        connection.getRepository(entity.type),
      inject: [DbConnectionToken],
    };
    return provider;
  });
}

/**
 * CompileEntities is a curried function which takes an array of an array of EntityProviders
 * It flattens this array into a single array of EntityProviders. It facilitates overriding of one EntityProvider over another
 * if they share the same Entity Token
 * @param entityGroups
 */
function CompileEntities(entityGroups: EntityProvider[][]): EntityProvider[] {
  let uniqueEntities = new Map<string, EntityProvider>();
  entityGroups.forEach(entities => {
    entities.forEach(entity => {
      uniqueEntities.set(entity.token, entity);
    });
  });

  let totalEntities: EntityProvider[] = [];
  uniqueEntities.forEach(entity => totalEntities.push(entity));

  return totalEntities;
}
