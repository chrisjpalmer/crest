import { UpMode, Params } from './util/util.class';
import { RunFormatter } from './util/util';
import { createAPI } from './api.builder/api.builder';
import { createEntity } from './entity.builder/entity.builder';
import './util/string.util';

async function main() {
  let entityName:string = "";
  let upMode:UpMode = null;
  
  //Process first argument
  let args = process.argv.slice(2);
  if (!args[0] || args[0].length === 0) {
    throw 'you must supply one argument - the entity name';
  }
  
  if (args[0] === 'create' || args[0] === 'c') {
    upMode = UpMode.CreateEntity;

    //Process second argument
    if (!args[1] || args[1].length === 0) {
      throw 'you must supply one argument - the entity name';
    }
    entityName = args[1];
  } else {
    upMode = UpMode.CreateAPI;
    entityName = args[0];
  }

  let coreMode = false;
  if(entityName.indexOf('core/') !== -1) {
    coreMode = true;
    entityName = entityName.substring('core/'.length, entityName.length);
  }

  await perform({entityName:entityName, coreMode:coreMode}, upMode);
}

async function perform(params:Params, mode:UpMode) {
  switch(mode) {
    case UpMode.CreateAPI:
      await createAPI(params);
      break;
    case UpMode.CreateEntity:
      await createEntity(params);
      break;
  }
  RunFormatter();
}


main();
