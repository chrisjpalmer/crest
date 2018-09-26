import { buildGeneric, genericReplace } from "./util/generic.builder";
import { AddServiceToModule } from "./module";
import { Name, Route, writeFilePromise, RunFormatterDir, RunFormatterFile, readFilePromise, replaceByObject, makeDirectoryPromise, makeDirectoryRecursive } from "./util/util";
import { TemplateReferenceHandler, addTemplateReference } from "./util/template.reference";

export async function buildService(name: Name) {
    
    let destination = 'src/app/services/';

    let service = await buildGeneric('up/template/service/service.template.ts', name, null, destination);

    makeDirectoryRecursive(destination);

    await writeFilePromise(`${destination}/${name.dot()}.service.ts`, service);

    AddServiceToModule(name);
    
    //Formatting
    RunFormatterFile(`${destination}/${name.dot()}.service.ts`);
    RunFormatterFile(`src/app/app.module.ts`);
}



/**
 * Controller Template References...
 * create them and register them...
 * they will be run in buildGeneric...
 */

interface ControllerPrivilegeTHData {
    suffix: string;
}

export class ControllerPrivilegeTH extends TemplateReferenceHandler<ControllerPrivilegeTHData> {
    static Mode: string = 'controller.privilege';

    async handle(): Promise<string> {
        if(this.route.isAuthenticated()) {
            return `@PrivilegeHas('${this.name.dot()}${this.params.suffix}')`;
        } else {
            return '';
        }
    }
}

addTemplateReference(<typeof TemplateReferenceHandler> ControllerPrivilegeTH);

interface ControllerDecoratorTHData {
    suffix: string;
}

export class ControllerDecoratorTH extends TemplateReferenceHandler<ControllerDecoratorTHData> {
    static Mode: string = 'controller.decorator';

    async handle(): Promise<string> {
        //Am I authenticated???
        let output:string = '';
        if(this.route.isAuthenticated()) {
            output = await readFilePromise(
                'up/template/common/controller.dec.template.authenticated.ts',
            );
        } else {
            output = await readFilePromise(
                'up/template/common/controller.dec.template.non.authenticated.ts',
            );
        }

        let shortroute = this.route.short();
        let longroute = this.route.long();
        if(!!this.params.suffix) {
            shortroute += this.params.suffix;
            longroute += this.params.suffix;
        }

        output = replaceByObject(output, {
            '${shortroute}': shortroute,
            '${longroute}': longroute
        });

        return output;
    }

}

addTemplateReference(<typeof TemplateReferenceHandler> ControllerDecoratorTH);