import { UpMode, Params } from './util/util.class';
import { transformEntity } from './entity.transformer/main';
import { createEntity } from './entity.builder/main';

import {Command, flags} from '@oclif/command'
import { replaceAll } from './util/string.util';
import { createController } from './basic.controller/main';

class Up extends Command {
  static flags = {
    destination: flags.string({
      required:false
    }),
    // run with --dir= or -d=
    entity: flags.string({
      required:false
    }),
    api: flags.string({
      required:false
    }),
  }

  static args = [
    {name: 'mode'}
  ]

  async run() {
    const {flags, args} = this.parse(Up);

    //Global parsing
    if(flags.entity) {
      if(flags.entity[0].toUpperCase() !== flags.entity[0]) {
        throw 'when specifying an entity, it should be specified in pascal case: ie. "Book", "BookCategory"';
      }
    }

    if(flags.api) {
      if(flags.api[0].toUpperCase() !== flags.api[0]) {
        throw 'when specifying an api, it should be specified in pascal case: ie. "Book", "BookCategory"';
      }
    }

    if(flags.destination) {
      //@ is a placeholder for authenticated
      flags.destination = replaceAll(flags.destination, '@', 'authenticated');
    }

    switch(args.mode) {
      case 'create':
        if(flags.entity && flags.api) {
          throw '--api flag is not supported with --entity flag';
        }
        if(!flags.entity && !flags.api) {
          throw 'expected --api OR --entity flag';
        }
        if(flags.api && !flags.destination) {
          throw '--destination flag expected when in api mode';
        }

        if(flags.api) {
          //Create a blank api
          await createController(flags.api, flags.destination);
        } else if(flags.entity) {
          //create a new entity
          await createEntity(flags.entity);
        }
        break;
      case 'transform':
        if(flags.api) {
          throw '--api flag is not valid in transform mode';
        }
        await transformEntity(flags.entity, flags.destination);
        break;
      default:
        throw 'requires mode of "create" OR "transform"';
    }
  }
}

Up.run(null, null)
.catch(require('@oclif/errors/handle'));

//TODO: support the new api.authenticated decorator template