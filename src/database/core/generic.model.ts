import { GenericEntity } from "./generic.entity";

export interface GenericModelActions {
    save(...args:any[]) : Promise<number>;
    delete(...args:any[]): Promise<void>;
}

export class GenericModel<T extends GenericEntity> {
    constructor(protected entity:T, public modelName:string) {}

    throwEntityNotSet() {
        this.throwObjectNotSet('entity');
    }

    throwObjectNotSet(objectName:string) {
        throw `${this.modelName} - ${objectName} object is not set`;
    }

    getUpdatedAt() {
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        return this.entity.updatedAt;
    }

    updateUpdatedAt(){
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        this.entity.updatedAt = <any>(() => 'CURRENT_TIMESTAMP');
    }

    getCreatedAt() {
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        return this.entity.createdAt;
    }

    getId(){
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        return this.entity.id;
    }

    isNew() {
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        if(!!this.entity.id){
            return true;
        }
        return false;
    }
}

export class RelationPingList {
    list = new Map<number, boolean>();

    add(id:number | null | undefined) {
        if(!!id) {
            this.list.set(id, true);
        }
    }

    getIds() {
        let ids:number[] = [];
        this.list.forEach((v, k) => ids.push(k));
        return ids;
    }

    hasIds() {
        return this.list.size > 0;
    }
}