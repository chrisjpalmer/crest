/** BOILERPLATE - don't touch unless you are brave */
import { NestFactory, NestApplicationContext } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  CoreWebModule,
  PrivilegeGuard,
  ConfigData,
  ConfigParse,
  LoggingInterceptor,
} from 'core';
let flags = require('flags');

/**
 * TIMEZONE OF SERVER AND DATABASE
 * The timezone of the server should be the local timezone which clients experience
 * If this application is to be used in Australia -> this means it is Australia/Sydney
 * However the database timezone is set to UTC. For this to work, TypeORM must believe the database's default timezone is UTC>
 * Additionally the database must have its Timezone set to UTC -> this is standard on most installations AND is the default with the docker MySQL
 * However if you run MAMP or WAMP on your local machine, you will find that the database timezone is set to local.
 *
 * When saving a date, TypeORM handles the timezones for us, by converting whatever timezone
 * the server has, to whatever it BELIEVES is the database timezone (as specified in core/core/core.database.provider.ts)
 */

async function init(): Promise<ConfigData> {
  //Command line arguments
  flags.defineString(
    'config',
    '/path/to/config',
    'The path to the configuration file which is required by this web server',
  );
  flags.parse();
  if (flags.get('config') === '/path/to/config') {
    throw 'config path is not set';
  }

  /**
   * Core web depends on a config.json file. This file needs to be read before
   * nest boots
   */
  await ConfigParse(flags.get('config'));

  return global['config'];
}

async function bootstrap() {
  //Create the application and register the main components
  console.log('Booting Nest Server');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalGuards(selectDynamic(app, 'CoreWebModule').get(PrivilegeGuard));
  app.useGlobalInterceptors(
    selectDynamic(app, 'CoreWebModule').get(LoggingInterceptor),
  );
  await app.listen(3000);
}

/**
 * This is a substitue for app.select() which doesn't work if the module was formed
 * dynamically. This function performs all the same operations that app does BUT searches
 * for the module using a different mechanism - which actually succeeds.
 * @param sapp
 * @param moduleName
 */
function selectDynamic(sapp: any, moduleName: string) {
  let map: Map<string, any> = sapp.container.modules;
  let selectedModule = null;
  map.forEach((v, k) => {
    if (k.indexOf(moduleName) !== -1) {
      selectedModule = v;
    }
  });
  let moduleMetatype = sapp.contextModule.metatype;
  let scope = sapp.scope.concat(moduleMetatype);
  let moduleInstance = new NestApplicationContext(
    sapp.container,
    scope,
    selectedModule,
  );
  return moduleInstance;
}

//Makes it possible to catch exceptions
async function bootstrapWrapper() {
  let config = await init();
  if (config.app.debug) {
    //Much easier to find errors in the bootstrapping process
    //when they are not handled.
    //Now we can break on any UnhandledExceptions
    await bootstrap();
  } else {
    //Nicer for logging
    try {
      await bootstrap();
    } catch (e) {
      console.log('The server was unable to start... an exception occurred');
      console.log(e);
    }
  }
}

bootstrapWrapper();

//TODO:
//add a logging interceptor.

/**
 * Dependancies:
 * tsconfig-paths
 * passport
 * passport-jwt
 * jsonwebtoken
 * class-transformer-validator
 */
