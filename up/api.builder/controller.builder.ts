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
  toPlural,
  dotCase,
} from '../util/util';
import { buildImport } from './import.builder';

export async function buildController(controllerPath: string, entity: Entity) {
  //Open the service template
  let controllerTemplate = await readFilePromise(
    `${templatePath}/entity.controller.template.ts`,
  );
  let controller = replaceByObject(controllerTemplate, {
    '${entity.upper}': entity.upper,
    '${entity.dot}': dotCase(entity.upper),
    '${entity.lower}': entity.lower,
    '${entity.lowerPlural}': toPlural(entity.lower),
    '${controllerPath}': controllerPath,
    '${entity.filename}': entity.filename,
    '/// < entity.imports.template >': buildImport(entity),
  });

  /// < entity.controller.post.field.template >
  let postField = await buildControllerPostField(entity);
  controller = controller.replaceAll(
    `/// < entity.controller.post.field.template >`,
    postField,
  );
  /// < entity.controller.post.relation.template >
  let postRelation = await buildControllerPostRelation(entity);
  controller = controller.replaceAll(
    `/// < entity.controller.post.relation.template >`,
    postRelation,
  );
  /// < entity.controller.patch.field.template >
  let patchField = await buildControllerPatchField(entity);
  controller = controller.replaceAll(
    `/// < entity.controller.patch.field.template >`,
    patchField,
  );
  /// < entity.controller.patch.relation.template >
  let patchRelation = await buildControllerPatchRelation(entity);
  controller = controller.replaceAll(
    `/// < entity.controller.patch.relation.template >`,
    patchRelation,
  );

  return controller;
}

/** POST */
async function buildControllerPostField(entity: Entity) {
  let postFieldTemplate = await readFilePromise(
    `${templatePath}/entity.controller.post.field.template.ts`,
  );
  let postField = '';

  entity.childFields
    .map(c => {
      return buildControllerPostFieldForChild(entity, c, postFieldTemplate);
    })
    .forEach(fw => {
      postField += fw + '\n\n';
    });

  return postField;
}

function buildControllerPostFieldForChild(
  entity: Entity,
  childField: ChildField,
  postFieldTemplate: string,
) {
  let postField = replaceByObject(postFieldTemplate, {
    '${childField.fieldName}': childField.fieldName,
  });
  return postField;
}

async function buildControllerPostRelation(entity: Entity) {
  let postRelationMultiple = await readFilePromise(
    `${templatePath}/entity.controller.post.relation.multiple.template.ts`,
  );
  let postRelationSingle = await readFilePromise(
    `${templatePath}/entity.controller.post.relation.single.template.ts`,
  );
  let postRelation = '';

  entity.childEntities
    .map(c => {
      if (c.mode == ChildEntityMode.multiple) {
        return buildControllerPostRelationForChild(
          entity,
          c,
          postRelationMultiple,
        );
      } else {
        return buildControllerPostRelationForChild(
          entity,
          c,
          postRelationSingle,
        );
      }
    })
    .forEach(pr => {
      postRelation += pr + '\n\n';
    });

  return postRelation;
}

function buildControllerPostRelationForChild(
  entity: Entity,
  childEntity: ChildEntity,
  postRelationTemplate: string,
) {
  let postRelation = replaceByObject(postRelationTemplate, {
    '${childEntity.fieldName}': childEntity.fieldName,
    '${childEntity.upper}': childEntity.upper,
  });
  return postRelation;
}

/** PATCH */
async function buildControllerPatchField(entity: Entity) {
  let patchFieldTemplate = await readFilePromise(
    `${templatePath}/entity.controller.patch.field.template.ts`,
  );
  let patchField = '';

  entity.childFields
    .map(c => {
      return buildControllerPatchFieldForChild(entity, c, patchFieldTemplate);
    })
    .forEach(fw => {
      patchField += fw + '\n\n';
    });

  return patchField;
}

function buildControllerPatchFieldForChild(
  entity: Entity,
  childField: ChildField,
  patchFieldTemplate: string,
) {
  let patchField = replaceByObject(patchFieldTemplate, {
    '${childField.fieldName}': childField.fieldName,
  });
  return patchField;
}

async function buildControllerPatchRelation(entity: Entity) {
  let patchRelationMultiple = await readFilePromise(
    `${templatePath}/entity.controller.patch.relation.multiple.template.ts`,
  );
  let patchRelationSingle = await readFilePromise(
    `${templatePath}/entity.controller.patch.relation.single.template.ts`,
  );
  let patchRelation = '';

  entity.childEntities
    .map(c => {
      if (c.mode == ChildEntityMode.multiple) {
        return buildControllerPatchRelationForChild(
          entity,
          c,
          patchRelationMultiple,
        );
      } else {
        return buildControllerPatchRelationForChild(
          entity,
          c,
          patchRelationSingle,
        );
      }
    })
    .forEach(pr => {
      patchRelation += pr + '\n\n';
    });

  return patchRelation;
}

function buildControllerPatchRelationForChild(
  entity: Entity,
  childEntity: ChildEntity,
  patchRelationTemplate: string,
) {
  let patchRelation = replaceByObject(patchRelationTemplate, {
    '${childEntity.fieldName}': childEntity.fieldName,
    '${childEntity.upper}': childEntity.upper,
  });
  return patchRelation;
}
