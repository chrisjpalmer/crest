import { Entity } from './entity.class';

export function buildImport(entity: Entity) {
  let imports = '';
  entity.childEntities.map(s => s.upper).forEach((s, i) => {
    imports += s;
    if (i + 1 !== entity.childEntities.length) {
      imports += ', ';
    }
  });
  let importsFull = `import { ${imports} } from 'database';`;
  return importsFull;
}
