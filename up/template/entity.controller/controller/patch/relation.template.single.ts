//Apply update to relationship
if (input.entries[i].${childEntity.fieldName} !== undefined) {
  if(input.entries[i].${childEntity.fieldName} === null) {
      o.${childEntity.fieldName} = null;
  } else {
      let c = new ${childEntity.upper}();
      c.id = v.${childEntity.fieldName}.id;
      o.${childEntity.fieldName} = c;
  }
}