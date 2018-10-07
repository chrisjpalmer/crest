/** BOILERPLATE - don't touch unless you are brave */
import { Injectable } from '@nestjs/common';
import { ConfigData } from './config.class';

//This service is registered with web module...
//Web module is registered in app module
//app module instantiates this component and allows it to be injected into the database.provider component.

function copyKeysToTarget(source, target) {
  Object.keys(source)
    .map(key => {
      let value = source[key];
      return { key, value };
    })
    .forEach(obj => (target[obj.key] = obj.value));
}

@Injectable()
export class ConfigService extends ConfigData {
  constructor() {
    super();

    //This is a little javascript hack BUT there is no
    //way to get this from the outside world apart from the global node.js variable
    //so we pull it from there.
    let configData: ConfigData = global['config'];
    copyKeysToTarget(configData, this);
  }
}
