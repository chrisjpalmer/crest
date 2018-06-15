import { Entity } from "../util/entity.class";

export function buildImport(entity: Entity, withTokens: boolean) {
  let imports = '';
  entity.childEntities.map(s => {
    if(!withTokens) { return s.upper; }
    return `${s.upper}, ${s.upper}Token`
  }).forEach((s, i) => {
    imports += s;
    if (i + 1 !== entity.childEntities.length) {
      imports += ', ';
    }
  });
  let importsFull = `import { ${imports} } from 'database';`;
  return importsFull;
}
