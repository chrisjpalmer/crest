.leftJoin(this.entity + '.${childEntity.fieldName}', '${childEntity.lower}')
.addSelect('${childEntity.lower}.id')