//Apply update to relationship
if (v.${childEntity.fieldName} !== undefined) {
  if(v.${childEntity.fieldName} === null) {
      o.${childEntity.fieldName} = null;
  } else {
      let c = new ${childEntity.upper}();
      c.id = v.${childEntity.fieldName}.id;
      o.${childEntity.fieldName} = c;
  }
}