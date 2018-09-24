import { Name, Route, writeFilePromise, RunFormatterFile } from "./util/util";
import { buildGeneric } from "./util/generic.builder";
import { AddToDatabaseIndex } from "./database-index";

export async function buildModel(name:Name) {
    let destination = 'src/database/app';
    let file = `${destination}/${name.dot()}.model.ts`;

    let model = await buildGeneric('up/template/model/model.template.ts', name, null, destination);
    
    await writeFilePromise(file, model);
    
    AddToDatabaseIndex(name, 'model')
    RunFormatterFile(file);
}