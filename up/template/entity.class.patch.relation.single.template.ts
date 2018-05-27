@ValidateNested()
@Type(() => PostRelation)
@IsArray()
@IsOptional()
${childEntity.fieldName}: PatchRelation;