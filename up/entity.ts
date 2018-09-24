
import { Name, Route, writeFilePromise, RunFormatterFile } from "./util/util";
import { buildGeneric } from "./util/generic.builder";
import { AddToDatabaseIndex } from "./database-index";

export async function buildEntity(name:Name) {
    let destination = 'src/database/app';
    let file = `${destination}/${name.dot()}.entity.ts`;

    let entity = await buildGeneric('up/template/entity/entity.template.ts', name, null, destination);
    
    await writeFilePromise(file, entity);
    
    AddToDatabaseIndex(name, 'entity')
    RunFormatterFile(file);
}