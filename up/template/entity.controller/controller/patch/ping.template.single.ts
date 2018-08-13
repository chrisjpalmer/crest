let ${childEntity.fieldName}BeforeRelations = toApply.map(v => v.${childEntity.fieldName});
let ${childEntity.fieldName}AfterRelations = toSave.map(v => v.${childEntity.fieldName});
await this.${entity.lower}Service.pingStemsPatch${childEntity.fieldNameUpper}(${childEntity.fieldName}BeforeRelations, ${childEntity.fieldName}AfterRelations); //Comment out at your leisure.