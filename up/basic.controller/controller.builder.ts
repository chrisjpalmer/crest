import { Entity } from '../util/entity.class';
import {
  readFilePromise,
  templatePath,
  readTemplateFilePromise,
} from '../util/util';
import { buildGeneric } from './generic.builder';

export async function buildController(
  controllerPath: string,
  apiUpper:string,
  apiDot:string
): Promise<string> {
  //Open the service template
  let controllerTemplate = await readTemplateFilePromise(
    `basic.controller/controller/controller.template.ts`,
  );

  let controller = await buildGeneric(
    controllerTemplate,
    controllerPath,
    apiUpper,
    apiDot
  );

  return controller;
}
