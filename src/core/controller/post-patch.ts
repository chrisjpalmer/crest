import { IsEnum, IsNumber } from 'class-validator';
import { NotAcceptableException } from '@nestjs/common';

export enum RelationMode {
  Exists,
  NotExists,
  Add,
  Delete,
}

export class PatchRelation {
  @IsEnum(RelationMode) mode: RelationMode;

  @IsNumber() id: number;
}

export class PostRelation {
  @IsNumber() id: number;
}

export interface GetRelation {
  id: number;
}

export interface patchRelationChild {
  id?: number;
}

/**
 * PatchRelationApply should be used to create a new array of child entities which can subsequently be
 * embeded into a parent entity, for the purpose of saving relationships between those entities.
 * TypeORM repository.save() method observes the elements of a child entity array (of a parent entity) and
 * takes this to be the definitive list of relations between the parent and children. The api protocol
 * for specifying creation or destruction of thoses relationships is done through the PatchRelation class type.
 * PathRelationApply applies an array of PatchRelations to the existing list of child entities to create a new
 * array of child entities. This will subsequently be embeded in the parent AND the relationships updated
 * through the repository.save() method.
 * @param parentId the id of the parent whose relationships will be affected
 * @param currentChildren the array of child entities which currently represent the relationships between the parent and its child
 * @param desiredChildren an array of patch relation objects which specify deletion of exiting relations and addition of new relations
 */
export function PatchRelationApply<T extends patchRelationChild>(
  parentId: number,
  currentChildren: T[],
  desiredChildren: PatchRelation[],
) {
  //1) Verify that all the desiredChildren have a valid PatchRelationMode
  desiredChildren.forEach(dc => {
    let isValid =
      dc.mode === RelationMode.Add || dc.mode === RelationMode.Delete;
    if (!isValid) {
      throw new NotAcceptableException(
        `patch relation between ${parentId} and child ${
          dc.id
        } has an invalid mode`,
      );
    }
  });

  //2) Itrerate through the current child relationships,index them by id.
  let childId2RelationData = new Map<
    number,
    { mode: RelationMode; value: patchRelationChild; index?: number }
  >();
  currentChildren.forEach((c, i) => {
    childId2RelationData.set(c.id, {
      mode: RelationMode.Exists,
      value: c,
      index: i,
    });
  });

  //3) Iterate through the desiredChildren (relationships we want to create OR destory)
  //Check for each item that the relationship action is valid.
  //Don't allow user to delete a relationship that doesn't exist
  desiredChildren.forEach(dc => {
    let relationData = childId2RelationData.get(dc.id);
    let mode = RelationMode.NotExists;
    if (relationData) {
      mode = relationData.mode;
    }

    if (dc.mode === RelationMode.Add) {
      if (mode === RelationMode.Exists) {
        throw new NotAcceptableException(
          `relation between parent ${parentId} and child ${
            dc.id
          } already exists`,
        );
      } else if (mode === RelationMode.Delete) {
        throw new NotAcceptableException(
          `you cannot add and delete relation between parent ${parentId} and child ${
            dc.id
          } in the same request`,
        );
      } else {
        childId2RelationData.set(dc.id, { mode: RelationMode.Add, value: dc });
      }
    } else {
      if (mode === RelationMode.NotExists) {
        throw new NotAcceptableException(
          `relation between parent ${parentId} and child ${
            dc.id
          } does not exist`,
        );
      } else if (mode === RelationMode.Add) {
        throw new NotAcceptableException(
          `you cannot add and delete relation between parent ${parentId} and child ${
            dc.id
          } in the same request`,
        );
      } else {
        let relationDataForDelete = childId2RelationData.get(dc.id);
        relationDataForDelete.mode = RelationMode.Delete;
        childId2RelationData.set(dc.id, relationDataForDelete);
      }
    }
  });

  //4) Apply the relationship actions from the childId2RelationData map, to a clone of the original child array
  //We do this to preserve order which makes debugging easier.
  let futureChildren = currentChildren.map(s => s); //Array clone
  childId2RelationData.forEach((relationData, childId) => {
    switch (relationData.mode) {
      case RelationMode.Add:
        //New Relations are added to the end of the children array
        futureChildren.push(<any>relationData.value);
        break;
      case RelationMode.Delete:
        //Old Relations are set to null to be marked for deletion.
        futureChildren[relationData.index] = null;
        break;
      case RelationMode.Exists:
        //These relations have remained unchanged so we do nothing to them.
        break;
    }
  });

  //5) Delete any children which were marke for deletion
  for (var i = 0; i < futureChildren.length; i++) {
    if (futureChildren[i] === null) {
      futureChildren.splice(i, 1);

      //Because i splice has deleted 1 element, we need i to refer to the next element in the array.
      //This next element is actually located at index [i].
      //We decrement i so that when it is incremented on the next iteration, it equals [i] again.
      i -= 1;
    }
  }

  return futureChildren;
}
