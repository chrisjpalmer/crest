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

export async function buildClass(
  controllerPath: string,
  apiUpper:string,
  apiDot:string
): Promise<string> {
  //Open the service template
  let classTemplate = await readTemplateFilePromise(`basic.controller/class/class.template.ts`);

  let code = await buildGeneric(classTemplate, controllerPath, apiUpper, apiDot);
  return code;
}
