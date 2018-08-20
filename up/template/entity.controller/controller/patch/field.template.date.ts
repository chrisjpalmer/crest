//Apply update to the property
if (input.entries[i].${childField.fieldName} !== undefined) {
    o.${childField.fieldName} = new Date(input.entries[i].${childField.fieldName});
}