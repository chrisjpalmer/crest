@ValidateNested()
@Type(() => PatchRelation)
@IsArray()
@IsOptional()
${childEntity.fieldName}: PatchRelation[];
