import {
  Entity,
  ChildEntity,
  ChildMode,
  ChildEntityMode,
} from '../util/entity.class';
import {
  readFilePromise,
  templatePath,
  toUpperTitleCase,
  replaceByObject,
  readTemplateFilePromise,
} from '../util/util';
import { buildGeneric } from './generic.builder';

export async function buildService(
  controllerPath: string,
  entity: Entity,
): Promise<string> {
  //Open the service template
  let serviceTemplate = await readTemplateFilePromise(
    `entity.controller/service/service.template.ts`,
  );

  let service = await buildGeneric(serviceTemplate, controllerPath, entity);

  return service;
}
