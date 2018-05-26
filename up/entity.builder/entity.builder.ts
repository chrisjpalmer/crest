import { Params } from "../util/util.class";
import { templatePath, replaceByObject, readFilePromise, dotCase, writeFilePromise, entityPath, toUpperTitleCase } from "../util/util";
import Project from 'ts-simple-ast';

export async function createEntity(params: Params) {
    let entityDot = dotCase(params.entityName);
    let entityUpper = toUpperTitleCase(params.entityName);

    //Create the entity class file and save it
    let entityTemplate = await readFilePromise(
        `${templatePath}/entity.template.ts`,
    );
    let entity = replaceByObject(entityTemplate, {
        '${entity.upper}': entityUpper,
    });
    await writeFilePromise(`${entityPath}/${entityDot}.input.ts`, entity);

    //Append the entity to the index.ts file
    let sourceFile = await readFilePromise(
        `src/database/index.ts`
    );
    
    //Add code to export the entity
    sourceFile.replace('/// < import entity >', `import { ${entityUpper} } from './app/${entityDot}.entity';\n/// < import entity >`);
    sourceFile.replace('/// < export entity >', `export * from './app/${entityDot}.entity';\n/// < export entity >`);
    sourceFile.replace('/// < export entity.token >', `export const ${entityUpper}Token = '${entityUpper}';\n/// < export entity.token >`);
    sourceFile.replace('/// < export entity.object >', `{ token: ${entityUpper}Token, type: ${entityUpper} },\n/// < export entity.object >`);

    await writeFilePromise(sourceFile, `src/database/index.ts`);
}