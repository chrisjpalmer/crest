import {
  Entity,
  ChildEntity,
  ChildMode,
  ChildEntityMode,
  ChildField,
} from '../util/entity.class';
import {
  readFilePromise,
  templatePath,
  toUpperTitleCase,
  replaceByObject,
  fieldTypeToString,
  fieldTypeToValidator,
  readTemplateFilePromise,
} from '../util/util';
import { buildGeneric } from './generic.builder';

export async function buildClass(controllerPath: string, entity: Entity) : Promise<string> {
  //Open the service template
  let classTemplate = await readTemplateFilePromise(
    `class/class.template.ts`,
  );

  let code = await buildGeneric(classTemplate, controllerPath, entity);
  return code;
  
}