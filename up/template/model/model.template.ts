import { GenericModel, GenericModelActions } from "../core/generic.model";
import { ${upper} } from "./${dot}.entity";
import { Repository } from "typeorm";

export class ${upper}Model extends GenericModel<${upper}> implements GenericModelActions {
    private constructor(entity: ${upper}, private ${lower}Repository: Repository<${upper}>) {
        super(entity, '${upper}Model');
    }

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

    async save() {
        //Prechecks
        if (!this.entity) {
            this.throwEntityNotSet();
        }

        //Update the entity
        this.updateUpdatedAt();
        await this.${lower}Repository.save(this.entity);

        return this.entity.id;
    }

    async delete() {
        if (!this.entity) {
            this.throwEntityNotSet();
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
                throw 'the ${lower} already exists';
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

     //Type 1
    setSomeTableId(someTableId:number, someTableRepository:Repository<SomeTable>) {
        if(!this.entity) {
            this.throwEntityNotSet();
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
        if(!this.entity.someTables) {
            return [];
        }
        return this.entity.someTables.id;
    }

    //Type 2
    setSomeTableIds(
        someTableIds: number[],
        someTableRepository: Repository<SomeTable>,
      ) {
        if (!this.entity) {
          this.throwEntityNotSet();
        }
    
        this.entity.someTables = someTableIds.map(id => {
          let entity = someTableRepository.create()
          entity.id = id;
          return entity;
        });
      }
    
      getSomeTableIds() : number[] {
        if (!this.entity) {
          this.throwEntityNotSet();
        }
        if (!this.entity.someTables) {
          return [];
        }
        return this.entity.someTables.map(entity => entity.id);
      }

    //Type 3
    /**
     * Adds a someTable to this ${lower}. It throws an error if the someTable does not exist.
     * If the someTable is already associated with the ${lower}, no error is thrown.
     * @param someTableId 
     * @param someTableRepository 
     */
    async addSomeTable(someTableId:number, someTableRepository:Repository<SomeTable>) {
        if (!this.entity) {
        this.throwEntityNotSet();
        }
        if (!this.entity.someTables) {
        this.entity.someTables = [];
        }

        let i = this.entity.someTables.findIndex(entity => entity.id === someTableId);
        if(i !== -1) {
        return;
        }

        let someTable = await someTableRepository.findOneOrFail(someTableId);
        this.entity.someTables.push(someTable);
    }

    /**
     * Deletes a someTable from the ${lower}. If the someTable is not associated, no error is thrown.
     * @param someTableId 
     */
    deleteSomeTable(someTableId:number) {
        if (!this.entity) {
        this.throwEntityNotSet();
        }
        if (!this.entity.someTables) {
        return;
        }

        let i = this.entity.someTables.findIndex(entity => entity.id === someTableId);
        if(i !== -1) {
        this.entity.someTables.splice(i, 1);
        }
    }
}