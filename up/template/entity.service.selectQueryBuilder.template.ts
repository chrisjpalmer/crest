.leftJoin('${entity.lower}.${childEntity.fieldName}', '${childEntity.lower}')
.addSelect('${childEntity.lower}.id')