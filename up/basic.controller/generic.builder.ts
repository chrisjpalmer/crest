import {
  Entity,
  ChildEntity,
  ChildField,
  ChildEntityMode,
} from '../util/entity.class';
import {
  dotCase,
  toPlural,
  replaceByObject,
  toUpperTitleCase,
  fieldTypeToString,
  readTemplateFilePromise,
  fieldTypeToValidator,
} from '../util/util';

export async function buildGeneric(
  template: string,
  controllerPath: string,
  apiUpper:string,
  apiDot:string,
): Promise<string> {
  let codeIteration1 = genericReplace(template, controllerPath, apiUpper, apiDot);
  let codeIteration2 = await handleTemplateReferences(
    codeIteration1,
    controllerPath
  );
  return codeIteration2;
}

export function genericReplace(
  template: string,
  controllerPath: string,
  apiUpper:string,
  apiDot:string,
) {
  return replaceByObject(template, {
    '${controllerPath}': controllerPath,
    '${api.upper}':apiUpper,
    '${api.dot}' : apiDot,
  });
}

export enum TemplateReferenceMode {
  ControllerDecorator
}

export type TemplateControllerDecorator = { authenticated:string, nonAuthenticated:string };

export class TemplateReference {
  mode: string; //childEntity.multipleSingle, childEntity.normal, childField.normal, entity.uniqueNonUnique
  templateFile: string;

  suffix?:string;

  compositeMode: TemplateReferenceMode;
  compositeTemplate:TemplateControllerDecorator;
}

export async function handleTemplateReferences(
  mainTemplate: string,
  controllerPath: string
): Promise<string> {
  //Should be able to handle whether it is entity OR field mode -> and then multiple or single mode.
  let sections = mainTemplate.split('///ref:');
  let compositeSections = [];
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];
    if (i === 0) {
      compositeSections.push(section);
      continue;
    }

    let firstline = section.substring(0, section.indexOf('\n'));
    let restOfSection = section.substring(
      section.indexOf('\n'),
      section.length,
    );
    let ref: TemplateReference = JSON.parse(firstline);

    
    if (ref.mode === 'api.authenticated') {
      ref.compositeMode = TemplateReferenceMode.ControllerDecorator;
    } else {
      throw 'unknown template reference type';
    }

    switch (ref.compositeMode) {
      case TemplateReferenceMode.ControllerDecorator:
        let authenticated = await readTemplateFilePromise(
          ref.templateFile + '.authenticated.ts',
        );
        let nonAuthenticated = await readTemplateFilePromise(
          ref.templateFile + '.non.authenticated.ts',
        );
        
        ref.compositeTemplate = <TemplateControllerDecorator>{
          authenticated,
          nonAuthenticated
        };
        break;
    }

    let generatedTemplateCode = '';
    switch (ref.compositeMode) {
      case TemplateReferenceMode.ControllerDecorator:
        generatedTemplateCode= genericReplaceControllerDecoratorTemplate(ref, controllerPath);
        break;
    }
    restOfSection = generatedTemplateCode + restOfSection;

    compositeSections.push(restOfSection);
  }
  let fullyGeneratedCode = compositeSections.join(' ');
  return fullyGeneratedCode;
}

export function genericReplaceControllerDecoratorTemplate(
  ref: TemplateReference,
  controllerPath: string,
) {
  let template: string;
  let compositeControllerPath:string;
  if(controllerPath.indexOf('authenticated') !== -1) {
    template = (<TemplateControllerDecorator>ref.compositeTemplate).authenticated;
    compositeControllerPath = controllerPath.split('authenticated/')[1];
  } else {
    template = (<TemplateControllerDecorator>ref.compositeTemplate).nonAuthenticated;
    compositeControllerPath = controllerPath;
  }

  if(!!ref.suffix) {
    compositeControllerPath += ref.suffix;
  }

  let result = replaceByObject(template, {
    '${controllerPath}': compositeControllerPath,
  });
  return result;
}
