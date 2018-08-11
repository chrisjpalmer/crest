//Apply update to relationship
if (!!input.entries[i].${childEntity.fieldName}) {
  o.${childEntity.fieldName} = PatchRelationApply(
    v.id,
    v.${childEntity.fieldName},
    input.entries[i].${childEntity.fieldName},
  );
}