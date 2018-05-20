import {
  ChildEntity,
  ChildMode,
  ChildEntityMode,
  ChildField,
  toFieldType,
  Entity,
} from './entity.class';
import Project from 'ts-simple-ast';
import {
  toUpperTitleCase,
  toLowerTitleCase,
  hasUniqueIndex,
  dotCase,
} from './util';

/**
 * Open a file which corresponds to the entity we want to generate code for.
 * Read the file and return a class which represents the entity.
 * If the entityName was faultCategory, buildEntityClass searches for the file src/database/app/fault.category.entity.ts
 * @param entityName upper or lower camelcase name of the entity e.g. FaultCategory or faultCategory
 */
export function buildEntityClass(entityName: string, entityFilename: string) {
  //Initialize the entity class
  let entity = new Entity();
  entity.lower = toLowerTitleCase(entityName);
  entity.upper = toUpperTitleCase(entity.lower);
  entity.filename = dotCase(entityName);

  //Get the members of the source entity
  let project = new Project();
  let sourceFile = project.addExistingSourceFile(
    `src/database/app/${entityFilename}.entity.ts`,
  );
  let sourceClass = sourceFile.getClassOrThrow(entity.upper);
  let sourceNodes = sourceClass.getProperties();

  /** Iterate over all the properties inside the model class.
   * Examine each property/member. If the member is an array OR object
   * this means it is a link to another entity. If not, the member is a regular field.
   * Based on what each member is, construct the class "entity" (defined above) to contain
   * the relationships AND fields the entity has.
   *
   *
   * TODO: Make this process take into account TypeORM decorators instead of assuming
   * all model properties are used for TypeORM
   */
  sourceNodes.forEach(n => {
    let t = n.getType();
    let mode: ChildMode;

    //Is the type of object an array OR object. If so, this represents a relatinship.
    if (t.isObjectType() || t.isArrayType()) {
      mode = ChildMode.relationship;
    } else {
      mode = ChildMode.field;
    }

    //Based on the whether this is a relationship OR field, lets add members
    //To the child entity class
    switch (mode) {
      case ChildMode.relationship:
        let childEntity: ChildEntity = new ChildEntity();
        childEntity.fieldName = n.getName();

        //inspect whether the property is an object
        //if so, its type will be the relation's entity type.
        //we can extract the type information from there
        //if the object is an array... we need to extract the get
        if (t.isArrayType()) {
          childEntity.mode = ChildEntityMode.multiple;
          childEntity.upper = t.getArrayType().getText();
          childEntity.lower = toLowerTitleCase(childEntity.upper);
        } else {
          childEntity.mode = ChildEntityMode.single;
          childEntity.upper = t.getText();
          childEntity.lower = toLowerTitleCase(childEntity.upper);
        }
        entity.childEntities.push(childEntity);
        break;
      case ChildMode.field:
        let childField: ChildField = new ChildField();
        childField.fieldName = n.getName();
        childField.fieldType = toFieldType(t);
        if (hasUniqueIndex(n)) {
          if (!entity.uniqueIndex) {
            entity.uniqueIndex = childField;
          }
        }
        entity.childFields.push(childField);
        break;
    }
  });

  return entity;
}
