import { GenericModel, GenericModelActions, RelationPingList } from "../core/generic.model";
import { ${upper} } from "./${dot}.entity";
import { Repository } from "typeorm";

export class ${upper}Model extends GenericModel<${upper}> implements GenericModelActions {
    private constructor(entity: ${upper}, private ${lower}Repository: Repository<${upper}>) {
        super(entity, '${upper}Model');
    }

    someTableRelations:RelationPingList = new RelationPingList();

    /**
     * Factories
     */

    static createNew(${lower}Repository: Repository<${upper}>) {
        let ${lower}: ${upper} = ${lower}Repository.create();
        return new ${upper}Model(${lower}, ${lower}Repository);
    }

    static async for${upper}Id(${lower}Id: number, ${lower}Repository: Repository<${upper}>) {
        let ${lower}: ${upper} = null;
        //Pull any related data which is necessary for this model to operate here
        try {
            ${lower} = await ${lower}Repository.createQueryBuilder('${lower}')
                .leftJoin('${lower}.someTable', 'someTable')
                .addSelect('someTable.id')
                .where('${lower}.id = :${lower}Id', { ${lower}Id })
                .getOne();
        } finally { }

        if (!${lower}) {
            throw `${lower} object does not exist for ${${lower}Id}`;
        }

        return new ${upper}Model(${lower}, ${lower}Repository);
    }

    /**
     * Actions
     */

    async save(someTableRepository:Repository<SomeTable>) {
        //Prechecks
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        if(!this.entity.someTable) {
            this.throwObjectNotSet('someTable');
        }

        //Update the entity
        this.updateUpdatedAt();
        await this.${lower}Repository.save(this.entity);

        //Ping stems
        if(this.someTableRelations.hasIds()) {
            await someTableRepository
                .createQueryBuilder('someTable')
                .update({ updatedAt: () => 'CURRENT_TIMESTAMP(6)' })
                .whereInIds(this.someTableRelations.getIds())
                .execute();
        }
        return this.entity.id;
    }

    async delete() {
        if (!this.entity) {
            this.throwEntityNotSet();
        }

        //Add all relations to the ping list
        this.someTableRelations.add(this.entity.someTable.id);

        //Ping stems
        if(this.someTableRelations.hasIds()) {
            await someTableRepository
                .createQueryBuilder('someTable')
                .update({ updatedAt: () => 'CURRENT_TIMESTAMP(6)' })
                .whereInIds(this.someTableRelations.getIds())
                .execute();
        }

        await this.${lower}Repository.delete(this.entity);
    }

    /**
     * Data getters and setters
     */

    async setSomeField(someField: string) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        //Duplicate check
        if (this.isNew()) {
            let result = await this.${lower}Repository.findOne({ someField: someField });
            if (!!result) {
                throw 'user already exists';
            }
        }
        this.entity.someField = someField;
    }

    getSomeField() {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        return this.entity.someField;
    }

    /**
     * Related entities getters and setters
     */

    setSomeTableId(someTableId:number, someTableRepository:Repository<SomeTable>) {
        if(!this.entity) {
            this.throwEntityNotSet();
        }

        //Ping Server Stems
        this.pingServer.add(someTableId);
        if(!!this.entity.server) {
            this.pingServer.add(this.entity.server.id);
        }

        //Set relationship
        let target = someTableRepository.create();
        target.id = someTableId;
        this.entity.someTable = target;
    }

    getSomeTableId() {
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        if(!this.entity.someTable) {
            this.throwObjectNotSet('someTable');
        }
        return this.entity.someTable.id;
    }
}