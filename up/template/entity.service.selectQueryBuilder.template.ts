.leftJoin(this.mainTableAlias + '.${childEntity.fieldName}', '${childEntity.lower}')
.addSelect('${childEntity.lower}.id')