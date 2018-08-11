//Apply update to relationship
if (!!input.entries[i].${childEntity.fieldName}) {
  let c = new  ${childEntity.upper}();
  c.id = input.entries[i].${childEntity.fieldName}.id;
  o.${childEntity.fieldName} = c;
}