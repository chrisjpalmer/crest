import { Name, readFilePromise, writeFilePromise, RunFormatterFile } from "./util/util";


export async function AddToDatabaseIndex(name:Name, type:'model' | 'entity') {
    let databaseIndexFile = await readFilePromise('src/database/index.ts');
  
    if(type === 'entity') {
        //Add code to export the entity
        databaseIndexFile = databaseIndexFile.replace(
        '/// < import entity >',
        `import { ${name.upper()} } from './app/${name.dot()}.entity';\n/// < import entity >`,
        );
        databaseIndexFile = databaseIndexFile.replace(
        '/// < export entity >',
        `export * from './app/${name.dot()}.entity';\n/// < export entity >`,
        );
        databaseIndexFile = databaseIndexFile.replace(
        '/// < export entity.token >',
        `export const ${name.upper()}Token = '${name.upper()}';\n/// < export entity.token >`,
        );
        databaseIndexFile = databaseIndexFile.replace(
        '/// < export entity.object >',
        `{ token: ${name.upper()}Token, type: ${name.upper()} },\n/// < export entity.object >`,
        );
    } else {
        //Add code to export the model
        databaseIndexFile = databaseIndexFile.replace(
        '/// < export model >',
        `export * from './app/${name.dot()}.model';\n/// < export model >`,
        );
    }
    await writeFilePromise('src/database/index.ts', databaseIndexFile);
    RunFormatterFile('src/database/index.ts');   
}