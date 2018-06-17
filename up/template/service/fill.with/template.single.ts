fillWith${childEntity.fieldNameUpper}(
${entity.lower}: ${entity.upper} | ${entity.upper}[] | Map<number, ${entity.upper}>,
indexed${childEntity.fieldNameUpper}: Map<number, ${childEntity.upper}>,
) {
    StitchSet(
        ${entity.lower},
        indexed${childEntity.fieldNameUpper},
        p => [p.${childEntity.fieldName}.id],
        (p, c) => (p.${childEntity.fieldName} = c[0]),
    );
}
