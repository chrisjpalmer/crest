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
} from '../util/util';

export async function buildInput(controllerPath: string, entity: Entity) {
  //Open the service template
  let inputTemplate = await readFilePromise(
    `${templatePath}/entity.input.template.ts`,
  );
  let input = replaceByObject(inputTemplate, {
    '${entity.upper}': entity.upper,
  });

  /// < entity.input.get.field.template >
  let getField = await buildInputGetField(entity);
  input = input.replaceAll(
    `/// < entity.input.get.field.template >`,
    getField,
  );
  /// < entity.input.post.field.template >
  let postField = await buildInputPostField(entity);
  input = input.replaceAll(
    `/// < entity.input.post.field.template >`,
    postField,
  );
  /// < entity.input.post.relation.template >
  let postRelation = await buildInputPostRelation(entity);
  input = input.replaceAll(
    `/// < entity.input.post.relation.template >`,
    postRelation,
  );
  /// < entity.input.patch.field.template >
  let patchField = await buildInputPatchField(entity);
  input = input.replaceAll(
    `/// < entity.input.patch.field.template >`,
    patchField,
  );
  /// < entity.input.patch.relation.template >
  let patchRelation = await buildInputPatchRelation(entity);
  input = input.replaceAll(
    `/// < entity.input.patch.relation.template >`,
    patchRelation,
  );

  return input;
}

/** GET */
async function buildInputGetField(entity: Entity) {
  let getFieldTemplate = await readFilePromise(
    `${templatePath}/entity.input.get.field.template.ts`,
  );
  let getField = '';

  entity.childFields
    .map(c => {
      return buildInputGetFieldForChild(entity, c, getFieldTemplate);
    })
    .forEach(fw => {
      getField += fw + '\n\n';
    });

  return getField;
}

function buildInputGetFieldForChild(
  entity: Entity,
  childField: ChildField,
  getFieldTemplate: string,
) {
  let getField = replaceByObject(getFieldTemplate, {
    '${childField.fieldType}': fieldTypeToString(childField.fieldType),
    '${childField.fieldName}': childField.fieldName,
  });
  return getField;
}


/** POST */
async function buildInputPostField(entity: Entity) {
  let postFieldTemplate = await readFilePromise(
    `${templatePath}/entity.input.post.field.template.ts`,
  );
  let postField = '';

  entity.childFields
    .map(c => {
      return buildInputPostFieldForChild(entity, c, postFieldTemplate);
    })
    .forEach(fw => {
      postField += fw + '\n\n';
    });

  return postField;
}

function buildInputPostFieldForChild(
  entity: Entity,
  childField: ChildField,
  postFieldTemplate: string,
) {
  let postField = replaceByObject(postFieldTemplate, {
    '${childField.fieldType}': fieldTypeToString(childField.fieldType),
    '${childField.fieldTypeValidator}': fieldTypeToValidator(
      childField.fieldType,
    ),
    '${childField.fieldName}': childField.fieldName,
  });
  return postField;
}

async function buildInputPostRelation(entity: Entity) {
  let postRelationMultiple = await readFilePromise(
    `${templatePath}/entity.input.post.relation.multiple.template.ts`,
  );
  let postRelationSingle = await readFilePromise(
    `${templatePath}/entity.input.post.relation.single.template.ts`,
  );
  let postRelation = '';

  entity.childEntities
    .map(c => {
      if (c.mode == ChildEntityMode.multiple) {
        return buildInputPostRelationForChild(entity, c, postRelationMultiple);
      } else {
        return buildInputPostRelationForChild(entity, c, postRelationSingle);
      }
    })
    .forEach(pr => {
      postRelation += pr + '\n\n';
    });

  return postRelation;
}

function buildInputPostRelationForChild(
  entity: Entity,
  childEntity: ChildEntity,
  postRelationTemplate: string,
) {
  let postRelation = replaceByObject(postRelationTemplate, {
    '${childEntity.fieldName}': childEntity.fieldName,
  });
  return postRelation;
}

/** PATCH */
async function buildInputPatchField(entity: Entity) {
  let patchFieldTemplate = await readFilePromise(
    `${templatePath}/entity.input.patch.field.template.ts`,
  );
  let patchField = '';

  entity.childFields
    .map(c => {
      return buildInputPatchFieldForChild(entity, c, patchFieldTemplate);
    })
    .forEach(fw => {
      patchField += fw + '\n\n';
    });

  return patchField;
}

function buildInputPatchFieldForChild(
  entity: Entity,
  childField: ChildField,
  patchFieldTemplate: string,
) {
  let patchField = replaceByObject(patchFieldTemplate, {
    '${childField.fieldType}': fieldTypeToString(childField.fieldType),
    '${childField.fieldTypeValidator}': fieldTypeToValidator(
      childField.fieldType,
    ),
    '${childField.fieldName}': childField.fieldName,
  });
  return patchField;
}

async function buildInputPatchRelation(entity: Entity) {
  let patchRelationMultiple = await readFilePromise(
    `${templatePath}/entity.input.patch.relation.multiple.template.ts`,
  );
  let patchRelationSingle = await readFilePromise(
    `${templatePath}/entity.input.patch.relation.single.template.ts`,
  );
  let patchRelation = '';

  entity.childEntities
    .map(c => {
      if (c.mode == ChildEntityMode.multiple) {
        return buildInputPatchRelationForChild(
          entity,
          c,
          patchRelationMultiple,
        );
      } else {
        return buildInputPatchRelationForChild(entity, c, patchRelationSingle);
      }
    })
    .forEach(pr => {
      patchRelation += pr + '\n\n';
    });

  return patchRelation;
}

function buildInputPatchRelationForChild(
  entity: Entity,
  childEntity: ChildEntity,
  patchRelationTemplate: string,
) {
  let patchRelation = replaceByObject(patchRelationTemplate, {
    '${childEntity.fieldName}': childEntity.fieldName,
  });
  return patchRelation;
}
