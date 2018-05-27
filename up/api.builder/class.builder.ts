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

export async function buildClass(controllerPath: string, entity: Entity) {
  //Open the service template
  let classTemplate = await readFilePromise(
    `${templatePath}/entity.class.template.ts`,
  );
  let cls = replaceByObject(classTemplate, {
    '${entity.upper}': entity.upper,
  });

  /// < entity.class.get.field.template >
  let getField = await buildClassGetField(entity);
  cls = cls.replaceAll(
    `/// < entity.class.get.field.template >`,
    getField,
  );
  /// < entity.class.post.field.template >
  let postField = await buildClassPostField(entity);
  cls = cls.replaceAll(
    `/// < entity.class.post.field.template >`,
    postField,
  );
  /// < entity.class.post.relation.template >
  let postRelation = await buildClassPostRelation(entity);
  cls = cls.replaceAll(
    `/// < entity.class.post.relation.template >`,
    postRelation,
  );
  /// < entity.class.patch.field.template >
  let patchField = await buildClassPatchField(entity);
  cls = cls.replaceAll(
    `/// < entity.class.patch.field.template >`,
    patchField,
  );
  /// < entity.class.patch.relation.template >
  let patchRelation = await buildClassPatchRelation(entity);
  cls = cls.replaceAll(
    `/// < entity.class.patch.relation.template >`,
    patchRelation,
  );

  return cls;
}

/** GET */
async function buildClassGetField(entity: Entity) {
  let getFieldTemplate = await readFilePromise(
    `${templatePath}/entity.class.get.field.template.ts`,
  );
  let getField = '';

  entity.childFields
    .map(c => {
      return buildClassGetFieldForChild(entity, c, getFieldTemplate);
    })
    .forEach(fw => {
      getField += fw + '\n\n';
    });

  return getField;
}

function buildClassGetFieldForChild(
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
async function buildClassPostField(entity: Entity) {
  let postFieldTemplate = await readFilePromise(
    `${templatePath}/entity.class.post.field.template.ts`,
  );
  let postField = '';

  entity.childFields
    .map(c => {
      return buildClassPostFieldForChild(entity, c, postFieldTemplate);
    })
    .forEach(fw => {
      postField += fw + '\n\n';
    });

  return postField;
}

function buildClassPostFieldForChild(
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

async function buildClassPostRelation(entity: Entity) {
  let postRelationMultiple = await readFilePromise(
    `${templatePath}/entity.class.post.relation.multiple.template.ts`,
  );
  let postRelationSingle = await readFilePromise(
    `${templatePath}/entity.class.post.relation.single.template.ts`,
  );
  let postRelation = '';

  entity.childEntities
    .map(c => {
      if (c.mode == ChildEntityMode.multiple) {
        return buildClassPostRelationForChild(entity, c, postRelationMultiple);
      } else {
        return buildClassPostRelationForChild(entity, c, postRelationSingle);
      }
    })
    .forEach(pr => {
      postRelation += pr + '\n\n';
    });

  return postRelation;
}

function buildClassPostRelationForChild(
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
async function buildClassPatchField(entity: Entity) {
  let patchFieldTemplate = await readFilePromise(
    `${templatePath}/entity.class.patch.field.template.ts`,
  );
  let patchField = '';

  entity.childFields
    .map(c => {
      return buildClassPatchFieldForChild(entity, c, patchFieldTemplate);
    })
    .forEach(fw => {
      patchField += fw + '\n\n';
    });

  return patchField;
}

function buildClassPatchFieldForChild(
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

async function buildClassPatchRelation(entity: Entity) {
  let patchRelationMultiple = await readFilePromise(
    `${templatePath}/entity.class.patch.relation.multiple.template.ts`,
  );
  let patchRelationSingle = await readFilePromise(
    `${templatePath}/entity.class.patch.relation.single.template.ts`,
  );
  let patchRelation = '';

  entity.childEntities
    .map(c => {
      if (c.mode == ChildEntityMode.multiple) {
        return buildClassPatchRelationForChild(
          entity,
          c,
          patchRelationMultiple,
        );
      } else {
        return buildClassPatchRelationForChild(entity, c, patchRelationSingle);
      }
    })
    .forEach(pr => {
      patchRelation += pr + '\n\n';
    });

  return patchRelation;
}

function buildClassPatchRelationForChild(
  entity: Entity,
  childEntity: ChildEntity,
  patchRelationTemplate: string,
) {
  let patchRelation = replaceByObject(patchRelationTemplate, {
    '${childEntity.fieldName}': childEntity.fieldName,
  });
  return patchRelation;
}
