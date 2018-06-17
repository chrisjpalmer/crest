import { Entity } from '../util/entity.class';
import {
  readFilePromise,
  templatePath,
  readTemplateFilePromise,
} from '../util/util';
import { buildGeneric } from './generic.builder';

export async function buildController(
  controllerPath: string,
  entity: Entity,
): Promise<string> {
  //Open the service template
  let controllerTemplate = await readTemplateFilePromise(
    `controller/controller.template.ts`,
  );

  let controller = await buildGeneric(
    controllerTemplate,
    controllerPath,
    entity,
  );

  return controller;
}
