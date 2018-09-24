import {
  replaceByObject,
  Name,
  Route,
  readFilePromise,
} from './util';
import { handleTemplateReferences } from './template.reference';

export async function buildGeneric(
  templateFile: string,
  name:Name,
  route:Route | null,
  destination:string,
  additionalKeys?:any
): Promise<string> {

  let output = await readFilePromise(templateFile);

  output = genericReplace(output, name, additionalKeys);

  output = await handleTemplateReferences(output, name, route, destination);
  
  return output;
}

export function genericReplace(
  templateFile: string,
  n:Name,
  additionalKeys:any,
) {
  let output = templateFile;

  output = replaceByObject(output, {
    '${upper}':n.upper(),
    '${lower}':n.lower(),
    '${dot}' : n.dot(),
  });

  if(additionalKeys) {
    output = replaceByObject(output, additionalKeys);
  }

  return output;
}