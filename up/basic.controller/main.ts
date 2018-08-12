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
import { AddToModule } from './module.util';
import { replaceAll } from '../util/string.util';

export async function createController(apiUpper:string, destinationPath?:string) {
  //Get the entity class
  let apiDot = dotCase(apiUpper);

  //Deterine controller path
  let controllerPath = '';
  let controllerSystemPath = '';
  if(destinationPath) {
    controllerPath = `${destinationPath}`;
  } else{
    let directoryStructure = replaceAll(apiDot, '.', '/');
    controllerPath = `authenticated/${directoryStructure}`;
  }
  controllerSystemPath = `${appRoutesPath}/${controllerPath}`;

  //Create the code...
  let controllerCode = await buildController(controllerPath, apiUpper, apiDot);
  let classCode = await buildClass(controllerPath, apiUpper, apiDot);

  //Save the code
  mkdirRecursive(controllerSystemPath);

  await writeFilePromise(
    `${controllerSystemPath}/${apiDot}.controller.ts`,
    controllerCode,
  );
  await writeFilePromise(`${controllerSystemPath}/${apiDot}.class.ts`, classCode);

  AddToModule(controllerPath, apiUpper, apiDot);

  RunFormatterDir(controllerSystemPath);
  RunFormatterFile(`src/app/app.module.ts`);
}
