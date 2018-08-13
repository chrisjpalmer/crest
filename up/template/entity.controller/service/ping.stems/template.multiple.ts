async pingStemsPost${childEntity.fieldNameUpper} (${childEntity.fieldName}Relations:GenericRelation[][]) : Promise<void> {
  await this._pingStems${childEntity.fieldNameUpper}(${childEntity.fieldName}Relations);
}

async pingStemsPatch${childEntity.fieldNameUpper} (${childEntity.fieldName}RelationsUpdated:GenericRelation[][]) : Promise<void> {
  await this._pingStems${childEntity.fieldNameUpper}(${childEntity.fieldName}RelationsUpdated);
}

async pingStemsDelete${childEntity.fieldNameUpper} (${childEntity.fieldName}Relations:GenericRelation[][]) : Promise<void> {
  await this._pingStems${childEntity.fieldNameUpper}(${childEntity.fieldName}Relations);
}

private async _pingStems${childEntity.fieldNameUpper} (${childEntity.fieldName}Relations:GenericRelation[][]) : Promise<void> {
  let relations:GenericRelation[] = [];
  ${childEntity.fieldName}Relations.forEach(r => {
    if(!!r) {
      relations.push(...r)
    }
  });
  let pingList = this.relationsToPingIds(relations);
  
  await this.${childEntity.lower}Repository
  .createQueryBuilder('${childEntity.lower}')
  .update({ updatedAt: () => 'CURRENT_TIMESTAMP(6)' })
  .whereInIds(pingList)
  .execute();
}
  