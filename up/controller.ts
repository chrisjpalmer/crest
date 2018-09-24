import { buildGeneric, genericReplace } from "./util/generic.builder";
import { AddToModule } from "./module";
import { Name, Route, writeFilePromise, RunFormatterDir, RunFormatterFile, readFilePromise, replaceByObject } from "./util/util";
import { TemplateReferenceHandler, addTemplateReference } from "./util/template.reference";

export async function buildController(name: Name, route: Route) {
    
    let destination = 'src/app/routes/' + route.full();

    let controller = await buildGeneric('up/template/controller/controller.template.ts', name, route, destination);
    let cls = await buildGeneric('up/template/controller/class.template.ts', name, route, destination);


    await writeFilePromise(`${destination}/${name.dot()}.class.ts`, cls);
    await writeFilePromise(`${destination}/${name.dot()}.controller.ts`, controller);

    AddToModule(name, route, destination);
    RunFormatterDir(destination);
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

        output = replaceByObject(output, {
            '${route}': this.route.short()
        });

        if(!!this.params.suffix) {
            output + this.params.suffix;
        }

        return output;
    }

}

addTemplateReference(<typeof TemplateReferenceHandler> ControllerDecoratorTH);