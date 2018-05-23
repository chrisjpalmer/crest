import { buildEntityClass } from './entity.builder';
import { buildController } from './controller.builder';
import { buildInput } from './input.builder';
import { buildService } from './service.builder';
import {
  writeFilePromise,
  appRoutesPath,
  dotCase,
  makeDirectoryPromise,
  mkdirRecursive,
  RunFormatter,
} from './util';
import './string.util';
import { AddToModule } from './module.builder';

//TODO add support for the -e flag
//TODO fix the privileges -> use dot case!

async function main() {
  let args = process.argv.slice(2);
  if (!args[0] || args[0].length === 0) {
    throw 'you must supply one argument - the entity name';
  }

  //For testing purposes
  let prefix = 'v2/';

  //EntityName is supplied in upper or lower camelcase
  let entityName = args[0];

  //Get the entity class
  let entityFilename = dotCase(entityName);
  let controllerPath = prefix + entityFilename.replaceAll('.', '/');
  let entity = buildEntityClass(entityName, entityFilename);

  //Create the code...
  let controllerCode = await buildController(controllerPath, entity);
  let inputCode = await buildInput(controllerPath, entity);
  let serviceCode = await buildService(controllerPath, entity);

  //Save the code
  let path = `${appRoutesPath}/authenticated/${controllerPath}`;
  mkdirRecursive(path);

  await writeFilePromise(
    `${path}/${entityFilename}.controller.ts`,
    controllerCode,
  );
  await writeFilePromise(`${path}/${entityFilename}.input.ts`, inputCode);
  await writeFilePromise(`${path}/${entityFilename}.service.ts`, serviceCode);

  AddToModule(controllerPath, entityFilename, entity);

  RunFormatter();
}

main();
