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
} from '../util/util';
import { buildImport } from './import.builder';

export async function buildService(controllerPath: string, entity: Entity) {
  //Open the service template
  let serviceTemplate = await readFilePromise(
    `${templatePath}/entity.service.template.ts`,
  );
  let service = replaceByObject(serviceTemplate, {
    '${entity.upper}': entity.upper,
    '${entity.lower}': entity.lower,
    '/// < entity.imports.template >': buildImport(entity),
  });

  /// < entity.service.supercall.template >
  let superCall = await buildServiceSuperCall(entity);
  service = service.replaceAll(
    `/// < entity.service.supercall.template >`,
    superCall,
  );

  /// < entity.service.fillWith.template >
  let fillWith = await buildFillWith(entity);
  service = service.replaceAll(
    `/// < entity.service.fillWith.template >`,
    fillWith,
  );

  /// < entity.service.selectQueryBuilder.template >
  let selectQueryBuilder = await buildSelectQueryBuilder(entity);
  service = service.replaceAll(
    `/// < entity.service.selectQueryBuilder.template >`,
    selectQueryBuilder,
  );

  return service;
}

async function buildServiceSuperCall(entity: Entity) {
  let superCall = '';
  if (entity.uniqueIndex) {
    superCall = await readFilePromise(
      `${templatePath}/entity.service.supercall.unique.template.ts`,
    );
    superCall = superCall.replaceAll(
      '${entity.uniqueIndex}',
      entity.uniqueIndex.fieldName,
    );
  } else {
    superCall = await readFilePromise(
      `${templatePath}/entity.service.supercall.non-unique.template.ts`,
    );
  }
  superCall = superCall.replaceAll('${entity.lower}', entity.lower);
  return superCall;
}

async function buildFillWith(entity: Entity) {
  let fillWithMultiple = await readFilePromise(
    `${templatePath}/entity.service.fillWith.multiple.template.ts`,
  );
  let fillWithSingle = await readFilePromise(
    `${templatePath}/entity.service.fillWith.single.template.ts`,
  );

  let fillWith = '';

  entity.childEntities
    .map(c => {
      if (c.mode == ChildEntityMode.multiple) {
        return buildFillWithForChild(entity, c, fillWithMultiple);
      } else {
        return buildFillWithForChild(entity, c, fillWithSingle);
      }
    })
    .forEach(fw => {
      fillWith += fw + '\n\n';
    });

  return fillWith;
}

function buildFillWithForChild(
  entity: Entity,
  childEntity: ChildEntity,
  fillWithTemplate: string,
) {
  let fillWith = replaceByObject(fillWithTemplate, {
    '${entity.upper}': entity.upper,
    '${entity.lower}': entity.lower,
    '${childEntity.fieldNameUpper}': toUpperTitleCase(childEntity.fieldName),
    '${childEntity.upper}': childEntity.upper,
    '${childEntity.fieldName}': childEntity.fieldName,
  });

  return fillWith;
}

async function buildSelectQueryBuilder(entity: Entity) {
  let selectQueryBuilderTemplate = await readFilePromise(
    `${templatePath}/entity.service.selectQueryBuilder.template.ts`,
  );

  let selectQueryBuilder = '';
  entity.childEntities
    .map(c => {
      return buildSelectQueryBuilderForChild(
        entity,
        c,
        selectQueryBuilderTemplate,
      );
    })
    .forEach(sqb => {
      selectQueryBuilder += sqb + '\n';
    });

  selectQueryBuilder += ';';
  return selectQueryBuilder;
}

function buildSelectQueryBuilderForChild(
  entity: Entity,
  childEntity: ChildEntity,
  selectQueryBuilderTemplate: string,
) {
  let selectQueryBuilder = replaceByObject(selectQueryBuilderTemplate, {
    '${entity.upper}': entity.upper,
    '${entity.lower}': entity.lower,
    '${childEntity.upper}': childEntity.upper,
    '${childEntity.lower}': childEntity.lower,
    '${childEntity.fieldName}': childEntity.fieldName,
    '${childEntity.fieldNameUpper}': toUpperTitleCase(childEntity.fieldName),
  });
  selectQueryBuilder;
  return selectQueryBuilder;
}
