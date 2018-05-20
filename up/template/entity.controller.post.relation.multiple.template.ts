if (!!v.${childEntity.fieldName}) {
    o.${childEntity.fieldName} = v.${childEntity.fieldName}.map(dc => <${childEntity.upper}>{ id: dc.id });
}