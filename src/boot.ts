/** BOILERPLATE - don't touch unless you are brave */
import { NestFactory, APP_FILTER } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import {
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

//Makes it possible to catch exceptions
export async function start() :Promise<INestApplication>{
  let config = await init();
  if (config.app.debug) {
    //Much easier to find errors in the bootstrapping process
    //when they are not handled.
    //Now we can break on any UnhandledExceptions
    return await _bootstrap();
  } else {
    //Nicer for logging
    try {
      await _bootstrap();
    } catch (e) {
      console.log('The server was unable to start... an exception occurred');
      console.log(e);
    }
  }
}


async function _bootstrap() {
    //Create the application and register the main components
    console.log('Booting Nest Server');
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();
    app.useGlobalFilters(app.get(APP_FILTER));
    app.useGlobalGuards(app.get(PrivilegeGuard));
    app.useGlobalInterceptors(
      app.get(LoggingInterceptor),
    );
    await app.listen(3000);
    return app;
  }