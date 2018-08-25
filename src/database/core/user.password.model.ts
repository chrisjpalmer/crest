import { GenericModel, GenericModelActions } from "./generic.model";
import { Repository } from "typeorm";
import { UserPassword } from "./user.password.entity";
import * as bcrypt from 'bcrypt';
import { User } from "./user.entity";

export class UserPasswordModel extends GenericModel<UserPassword> implements GenericModelActions {
    constructor(entity: UserPassword, private userPasswordRepository: Repository<UserPassword>, private saltRounds: number) {
        super(entity, 'UserPasswordModel');
    }

    /**
     * Factories
     */

    public static async forUserId(userId: number, userPasswordRepository: Repository<UserPassword>, saltRounds: number) {
        let userPassword: UserPassword = null;
        try {
            userPassword = await userPasswordRepository.createQueryBuilder('userPassword')
                .innerJoin('userPassword.user', 'user')
                .where('user.id = :userId', { userId }).getOne();
        } finally { }

        if (!userPassword) {
            throw `UserPassword object does not exist for ${userId}`;
        }

        return new UserPasswordModel(userPassword, userPasswordRepository, saltRounds);
    }

    public static createNew(userPasswordRepository: Repository<UserPassword>, saltRounds: number) {
        let userPassword = userPasswordRepository.create();
        return new UserPasswordModel(userPassword, userPasswordRepository, saltRounds);
    }

    /**
     * Actions
     */

    async save(): Promise<number> {
        this.updateUpdatedAt();
        await this.userPasswordRepository.save(this.entity);
        return this.entity.id;
    }

    async delete() {
        await this.userPasswordRepository.delete(this.entity);
    }

    /**
     * Data getters and setters
     */

    async setPassword(plainTextPassword: string) {
        let hash = await this.hashPassword(plainTextPassword);
        this.entity.hash = hash;
    }

    setUserId(userId:number, userRepository:Repository<User>) {
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        let target = userRepository.create();
        target.id = userId;
        this.entity.user = target;
    }

    getUserId() {
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        if(!this.entity.user) {
            this.throwObjectNotSet('user');
        }
        return this.entity.user.id;
    }

    async validatePassword(plainTextPassword: string): Promise<void> {
        let isSame = await this.doesMatchPassword(plainTextPassword);
        if (isSame) {
            return;
        }
        throw 'passwords do not match';
    }

    private async hashPassword(plainTextPassword: string): Promise<string> {
        let genHash = new Promise<string>((resolve, reject) => {
            bcrypt.hash(plainTextPassword, this.saltRounds, (
                err,
                hash: string,
            ) => {
                if (err !== undefined) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        });

        let hash = '';
        try {
            hash = await genHash;
        } catch (e) {
            throw 'error occurred while trying to derive password hash';
        }
        return hash;
    }

    private async doesMatchPassword(plainTextPassword: string): Promise<boolean> {
        let validate = new Promise<boolean>((resolve, reject) => {
            bcrypt.compare(plainTextPassword, this.entity.hash, (err, res) => {
                if (err !== undefined) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });

        let result = false;
        try {
            result = await validate;
        } catch (e) {
            throw 'error occurred while trying to compare the password hash';
        }

        return result;
    }
}