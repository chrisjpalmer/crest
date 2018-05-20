fillWith${childEntity.fieldNameUpper}(
${entity.lower}: ${entity.upper} | ${entity.upper}[] | Map<number, ${entity.upper}>,
indexed${childEntity.fieldNameUpper}: Map<number, ${childEntity.upper}>,
) {
    StitchSet(
        ${entity.lower},
        indexed${childEntity.fieldNameUpper},
        p => p.${childEntity.fieldName}.map(c => c.id),
        (p, c) => (p.${childEntity.fieldName} = c),
    );
}