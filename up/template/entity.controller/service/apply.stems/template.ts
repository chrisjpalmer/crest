applyStems${childEntity.fieldNameUpper}( query: SelectQueryBuilder<${entity.upper}> ): SelectQueryBuilder<${entity.upper}> {
    return query.leftJoin(this.mainTableAlias + '.${childEntity.fieldName}', '${childEntity.lower}').addSelect('${childEntity.lower}.id');
}
