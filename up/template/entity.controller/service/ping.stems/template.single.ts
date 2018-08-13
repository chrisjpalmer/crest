async pingStemsPost${childEntity.fieldNameUpper} (${childEntity.fieldName}Relations:GenericRelation[]) : Promise<void> {
  await this._pingStemsBasic${childEntity.fieldNameUpper}(${childEntity.fieldName}Relations);
}

async pingStemsPatch${childEntity.fieldNameUpper} (${childEntity.fieldName}BeforeRelations:GenericRelation[], ${childEntity.fieldName}AfterRelations:GenericRelation[]) : Promise<void> {
  await this._pingStemsBeforeAfter${childEntity.fieldNameUpper}(${childEntity.fieldName}BeforeRelations, ${childEntity.fieldName}AfterRelations);
}

async pingStemsDelete${childEntity.fieldNameUpper} (${childEntity.fieldName}Relations:GenericRelation[]) : Promise<void> {
  await this._pingStemsBasic${childEntity.fieldNameUpper}(${childEntity.fieldName}Relations);
}

private async _pingStemsBasic${childEntity.fieldNameUpper} (${childEntity.fieldName}Relations:GenericRelation[]) : Promise<void> {
  let relations:GenericRelation[] = [];
  ${childEntity.fieldName}Relations.forEach(r => {
    if(!!r) {
      relations.push(r)
    }
  });
  let pingList = this.relationsToPingIds(relations);
  
  await this.${childEntity.lower}Repository
  .createQueryBuilder('${childEntity.lower}')
  .update({ updatedAt: () => 'CURRENT_TIMESTAMP(6)' })
  .whereInIds(pingList)
  .execute();
}

private async _pingStemsBeforeAfter${childEntity.fieldNameUpper} (${childEntity.fieldName}BeforeRelations:GenericRelation[], ${childEntity.fieldName}AfterRelations:GenericRelation[]) : Promise<void> {
    let relations:GenericRelation[] = [];
    for(let i = 0; i < ${childEntity.fieldName}BeforeRelations.length; i++) {
      let before = ${childEntity.fieldName}BeforeRelations[i];
      let after = ${childEntity.fieldName}AfterRelations[i];

      if(after === undefined) {
        continue;
      }

      if(after === null) {
        relations.push(before); //The "before" relation was removed so update it only
      } else if(before.id !== after.id) {
        relations.push(before, after); //The relation has totally changed... update both
      }
    }
    let pingList = this.relationsToPingIds(relations);
    
    await this.${childEntity.lower}Repository
    .createQueryBuilder('${childEntity.lower}')
    .update({ updatedAt: () => 'CURRENT_TIMESTAMP(6)' })
    .whereInIds(pingList)
    .execute();
  }
