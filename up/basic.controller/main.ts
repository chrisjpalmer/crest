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
import { AddToModule } from './module.util';
import { replaceAll } from '../util/string.util';

export async function createController(entityName:string, destinationPath?:string) {
  //Get the entity class
  let entityFilename = dotCase(entityName);
  let entity = readEntityClass(entityName, entityFilename);

  //Deterine controller path
  let controllerPath = '';
  if(destinationPath) {
    let controllerPath = `${appRoutesPath}/${destinationPath}`;
  } else{
    let directoryStructure = replaceAll(entityFilename, '.', '/');
    let controllerPath = `${appRoutesPath}/authenticated/${directoryStructure}`;
  }

  //Create the code...
  let controllerCode = await buildController(controllerPath, entity);
  let classCode = await buildClass(controllerPath, entity);

  //Save the code
  mkdirRecursive(controllerPath);

  await writeFilePromise(
    `${controllerPath}/${entityFilename}.controller.ts`,
    controllerCode,
  );
  await writeFilePromise(`${controllerPath}/${entityFilename}.class.ts`, classCode);

  AddToModule(controllerPath, entityFilename, entity);

  RunFormatterDir(controllerPath);
  RunFormatterFile(`src/app/app.module.ts`);
}
