import { Route, Name } from "./util";

export interface TemplateReference {
    mode:string;
    params:any;
}

export class TemplateReferenceHandler<T> {

    static Mode:string = '';

    constructor(protected name:Name, protected route:Route | null, protected destination:string, protected params:T) {

    }

    async handle() : Promise<string> {
        return '';
    }
}

let templateReferences = new Map<string, typeof TemplateReferenceHandler>();

export function addTemplateReference(reference:typeof TemplateReferenceHandler) {
    templateReferences.set(reference.Mode, reference);
}

export async function handleTemplateReferences(input:string, name:Name, route:Route | null, destination:string) {
     //Should be able to handle whether it is entity OR field mode -> and then multiple or single mode.
     let sections = input.split('///ref:');
     let compositeSections = [];
     for (let i = 0; i < sections.length; i++) {
       let section = sections[i];
       if (i === 0) {
         compositeSections.push(section);
         continue;
       }
   
       let firstline = section.substring(0, section.indexOf('\n'));
       let restOfSection = section.substring(
         section.indexOf('\n'),
         section.length,
       );
       let ref: TemplateReference = JSON.parse(firstline);
   
       let referenceHandlerType = templateReferences.get(ref.mode);
       let referenceHandler = new referenceHandlerType(name, route, destination, ref.params);
       
      
       let referenceCode = await referenceHandler.handle()

       let totalSection = referenceCode + restOfSection;
   
       compositeSections.push(totalSection);
     }
     let fullyGeneratedCode = compositeSections.join(' ');
     return fullyGeneratedCode;
}