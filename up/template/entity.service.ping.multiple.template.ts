async pingStems${childEntity.fieldNameUpper} (entries:(PostInput${entity.upper} | PatchInput${entity.upper})[]) : Promise<void> {
    let relations:(PostRelation| PatchRelation)[] = [];
    entries.map(v => v.${childEntity.fieldName}).forEach(r => relations.push(...r));
    let pingList = this.relationsToPingIds(relations);
    
    await this.${childEntity.lower}Repository
    .createQueryBuilder('${childEntity.lower}')
    .update({ updatedAt: new Date() })
    .whereInIds(pingList)
    .execute();
  }