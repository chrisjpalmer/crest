async pingStems${childEntity.fieldNameUpper} (entries:${entity.upper}Entry[]) : Promise<void> {
    let relations:GenericRelation[] = [];
    entries.map(v => v.${childEntity.fieldName}).forEach(r => {
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
  