if (!!v.${childEntity.fieldName}) {
    let c = new ${childEntity.upper}();
    c.id = v.${childEntity.fieldName}.id;
    o.${childEntity.fieldName} = c;
}