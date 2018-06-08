import { Params } from '../util/util.class';
import {
  dotCase,
  appRoutesPath,
  mkdirRecursive,
  writeFilePromise,
  setEntityPath,
  RunFormatterDir,
  RunFormatterFile,
} from '../util/util';
import { buildController } from './controller.builder';
import { buildClass } from './class.builder';
import { buildService } from './service.builder';
import { readEntityClass } from './entity.reader';
import { AddToModule } from './module.builder';

export async function createAPI(params: Params) {
  if (params.coreMode) {
    setEntityPath('src/database/core');
  }
  //For testing purposes
  let prefix = '';

  //Get the entity class
  let entityFilename = dotCase(params.entityName);
  let controllerPath = prefix + entityFilename.replaceAll('.', '/');
  let entity = readEntityClass(params.entityName, entityFilename);

  //Create the code...
  let controllerCode = await buildController(controllerPath, entity);
  let classCode = await buildClass(controllerPath, entity);
  let serviceCode = await buildService(controllerPath, entity);

  //Save the code
  let path = `${appRoutesPath}/authenticated/${controllerPath}`;
  mkdirRecursive(path);

  await writeFilePromise(
    `${path}/${entityFilename}.controller.ts`,
    controllerCode,
  );
  await writeFilePromise(`${path}/${entityFilename}.class.ts`, classCode);
  await writeFilePromise(`${path}/${entityFilename}.service.ts`, serviceCode);

  AddToModule(controllerPath, entityFilename, entity);

  RunFormatterDir(path);
  RunFormatterFile(`src/app/app.module.ts`);
}
