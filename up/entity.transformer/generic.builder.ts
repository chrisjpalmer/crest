import {
  Entity,
  ChildEntity,
  ChildField,
  ChildEntityMode,
  FieldType,
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
import { buildImport } from './import.builder';

export async function buildGeneric(
  template: string,
  controllerPath: string,
  entity: Entity,
): Promise<string> {
  let codeIteration1 = genericReplace(template, controllerPath, entity);
  let codeIteration2 = await handleTemplateReferences(
    codeIteration1,
    controllerPath,
    entity,
  );
  return codeIteration2;
}

export function genericReplace(
  template: string,
  controllerPath: string,
  entity: Entity,
) {
  return replaceByObject(template, {
    '${entity.upper}': entity.upper,
    '${entity.dot}': dotCase(entity.upper),
    '${entity.lower}': entity.lower,
    '${entity.lowerPlural}': toPlural(entity.lower),
    '${controllerPath}': controllerPath,
    '${entity.filename}': entity.filename,
    '///cust:importChildEntitiesAndTokens': buildImport(entity, true),
    '///cust:importChildEntities': buildImport(entity, false),
  });
}

export enum TemplateReferenceMode {
  ChildEntityMultipleSingle,
  ChildEntityNormal,
  EntityUniqueNonUnique,
  ChildFieldNormal,
  ControllerDecorator,
  HasPrivileges
}

export type TemplateMultipleSingle = { multiple: string; single: string };
export type TemplateUniqueNonUnique = { unique: string; nonUnique: string };
export type TemplateDateNonDate = { date: string; nonDate: string };
export type TemplateControllerDecorator = { authenticated:string, nonAuthenticated:string };
export type TemplateNormal = string;

export class TemplateReference {
  mode: string; //childEntity.multipleSingle, childEntity.normal, childField.normal, entity.uniqueNonUnique
  templateFile: string;

  suffix?:string;

  compositeMode: TemplateReferenceMode;
  compositeTemplate:
    | TemplateNormal
    | TemplateDateNonDate
    | TemplateControllerDecorator
    | TemplateMultipleSingle
    | TemplateUniqueNonUnique;
}

export async function handleTemplateReferences(
  mainTemplate: string,
  controllerPath: string,
  entity: Entity,
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

    if (ref.mode === 'childEntity.multipleSingle') {
      ref.compositeMode = TemplateReferenceMode.ChildEntityMultipleSingle;
    } else if (ref.mode === 'childEntity.normal') {
      ref.compositeMode = TemplateReferenceMode.ChildEntityNormal;
    } else if (ref.mode === 'entity.uniqueNonUnique') {
      ref.compositeMode = TemplateReferenceMode.EntityUniqueNonUnique;
    } else if (ref.mode === 'childField.normal') {
      ref.compositeMode = TemplateReferenceMode.ChildFieldNormal;
    } else if (ref.mode === 'api.authenticated') {
      ref.compositeMode = TemplateReferenceMode.ControllerDecorator;
    } else if (ref.mode === 'api.has.privileges') {
      ref.compositeMode = TemplateReferenceMode.HasPrivileges;
    } else {
      throw 'unknown template reference type';
    }

    switch (ref.compositeMode) {
      case TemplateReferenceMode.ChildEntityMultipleSingle:
        let multiple = await readTemplateFilePromise(
          ref.templateFile + '.multiple.ts',
        );
        let single = await readTemplateFilePromise(
          ref.templateFile + '.single.ts',
        );
        ref.compositeTemplate = <TemplateMultipleSingle>{
          multiple,
          single,
        };
        break;
      case TemplateReferenceMode.EntityUniqueNonUnique:
        let unique = await readTemplateFilePromise(
          ref.templateFile + '.unique.ts',
        );
        let nonUnique = await readTemplateFilePromise(
          ref.templateFile + '.non.unique.ts',
        );
        ref.compositeTemplate = <TemplateUniqueNonUnique>{
          unique,
          nonUnique,
        };
        break;
      case TemplateReferenceMode.ChildFieldNormal:
        let nonDate = await readTemplateFilePromise(
          ref.templateFile + '.ts',
        );
        let date = await readTemplateFilePromise(
          ref.templateFile + '.date.ts',
        );
        ref.compositeTemplate = <TemplateDateNonDate>{
          nonDate,
          date,
        };
        break;
      case TemplateReferenceMode.ChildEntityNormal:
        ref.compositeTemplate = <TemplateNormal>await readTemplateFilePromise(
          ref.templateFile + '.ts',
        );
        break;
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
      case TemplateReferenceMode.ChildEntityNormal:
      case TemplateReferenceMode.ChildEntityMultipleSingle:
        generatedTemplateCode = entity.childEntities
          .map(e =>
            genericReplaceChildEntityTemplate(ref, controllerPath, entity, e),
          )
          .join('\n');
        break;
      case TemplateReferenceMode.ChildFieldNormal:
        generatedTemplateCode = entity.childFields
          .map(f =>
            genericReplaceChildFieldTemplate(ref, controllerPath, entity, f),
          )
          .join('\n');
        break;
      case TemplateReferenceMode.EntityUniqueNonUnique:
        generatedTemplateCode = genericReplaceEntityUniqueNonUniqueTemplate(
          ref,
          controllerPath,
          entity,
        );
        break;
      case TemplateReferenceMode.ControllerDecorator:
        generatedTemplateCode = genericReplaceControllerDecoratorTemplate(ref, controllerPath);
        break;
      case TemplateReferenceMode.HasPrivileges:
        if(controllerPath.indexOf('authenticated') !== -1) {
          generatedTemplateCode = `@PrivilegeHas('${dotCase(entity.upper)}${ref.suffix ? ref.suffix : ''}')`;
        }
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

export function genericReplaceChildEntityTemplate(
  ref: TemplateReference,
  controllerPath: string,
  entity: Entity,
  childEntity: ChildEntity,
) {
  let template: string;
  if (ref.compositeMode === TemplateReferenceMode.ChildEntityMultipleSingle) {
    if (childEntity.mode === ChildEntityMode.multiple) {
      template = (<TemplateMultipleSingle>ref.compositeTemplate).multiple;
    } else {
      template = (<TemplateMultipleSingle>ref.compositeTemplate).single;
    }
  } else {
    template = <TemplateNormal>ref.compositeTemplate;
  }

  let result = genericReplace(template, controllerPath, entity);
  result = replaceByObject(result, {
    '${childEntity.fieldNameUpper}': toUpperTitleCase(childEntity.fieldName),
    '${childEntity.fieldName}': childEntity.fieldName,
    '${childEntity.upper}': childEntity.upper,
    '${childEntity.lower}': childEntity.lower,
  });
  return result;
}

export function genericReplaceChildFieldTemplate(
  ref: TemplateReference,
  controllerPath: string,
  entity: Entity,
  childField: ChildField,
) {
  let template:string;
  if (childField.fieldType === FieldType.Date) {
    template = (<TemplateDateNonDate>ref.compositeTemplate).date;
  } else {
    template = (<TemplateDateNonDate>ref.compositeTemplate).nonDate;
  }

  let result = genericReplace(template, controllerPath, entity);
  result = replaceByObject(result, {
    '${childField.fieldName}': childField.fieldName,
    '${childField.fieldType}': fieldTypeToString(childField.fieldType),
    '${childField.fieldTypeValidator}': fieldTypeToValidator(
      childField.fieldType,
    ),
  });
  return result;
}

export function genericReplaceEntityUniqueNonUniqueTemplate(
  ref: TemplateReference,
  controllerPath: string,
  entity: Entity,
) {
  let template: string;
  if (!!entity.uniqueIndex) {
    template = (<TemplateUniqueNonUnique>ref.compositeTemplate).unique;
  } else {
    template = (<TemplateUniqueNonUnique>ref.compositeTemplate).nonUnique;
  }

  let result = genericReplace(template, controllerPath, entity);
  let replaceObj = {
    '${entity.lower}': entity.lower,
  };
  if (!!entity.uniqueIndex) {
    replaceObj['${entity.uniqueIndex}'] = entity.uniqueIndex.fieldName;
  }
  result = replaceByObject(result, replaceObj);
  return result;
}
