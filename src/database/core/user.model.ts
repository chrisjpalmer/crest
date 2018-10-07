import { GenericModel, GenericModelActions } from "./generic.model";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { Role } from "./role.entity";
import { UserPassword } from "./user.password.entity";

export class UserModel extends GenericModel<User> implements GenericModelActions {
    constructor(entity: User, private userRepository: Repository<User>) {
        super(entity, 'UserModel');
    }

    /**
     * Factories
     */
    public static async forUserId(userId: number, userRepository: Repository<User>) {
        let user: User = null;
        try {
            user = await userRepository.createQueryBuilder('user')
                .leftJoin('user.role', 'role')
                .addSelect('role.id')
                .leftJoin('user.sessions', 'session')
                .addSelect('session.id')
                .leftJoin('user.usePassword', 'userPassword')
                .addSelect('userPassword.id')
                .where('user.id = :userId', { userId })
                .getOne();
        } finally { }

        if (!user) {
            throw `User object does not exist for ${userId}`;
        }

        return new UserModel(user, userRepository);
    }

    public static async forUsername(username: string, userRepository: Repository<User>) {
        let user: User = null;
        try {
            user = await userRepository.createQueryBuilder('user')
                .leftJoin('user.role', 'role')
                .addSelect('role.id')
                .leftJoin('user.sessions', 'session')
                .addSelect('session.id')
                .leftJoin('user.usePassword', 'userPassword')
                .addSelect('userPassword.id')
                .where('user.username = :username', { username })
                .getOne();
        } finally { }

        if (!user) {
            throw `User object does not exist for ${username}`;
        }

        return new UserModel(user, userRepository);
    }

    public static createNew(userRepository: Repository<User>) {
        let user: User = userRepository.create();
        return new UserModel(user, userRepository);
    }

    /**
     * Actions
     */

    async save() {
        this.updateUpdatedAt();
        await this.userRepository.save(this.entity);
        return this.entity.id;
    }

    async delete() {
        await this.userRepository.delete(this.entity);
    }

    /**
     * Data getters and setters
     */
    getUsername() {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        return this.entity.username;
    }
    async setUsername(username: string) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        //Duplicate check
        if (this.isNew()) {
            let result = await this.userRepository.findOne({ username: username });
            if (!!result) {
                throw 'user already exists';
            }
        }
        this.entity.username = username;
    }
    getFirstName() {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        return this.entity.firstName;
    }
    setFirstName(firstName: string) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        this.entity.firstName = firstName;
    }
    getLastName() {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        return this.entity.lastName;
    }
    setLastName(lastName: string) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        this.entity.lastName = lastName;
    }

    /**
     * Relationship getters and setters
     */
    getRoleId() {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        if (!this.entity.role) {
            return null;
        }
        return this.entity.role.id;
    }
    setRoleId(roleId: number, roleRepository: Repository<Role>) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        let target = roleRepository.create();
        target.id = roleId;
        this.entity.role = target;
    }
    getUserPasswordId() {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        if (!this.entity.userPassword) {
            return null;
        }
        return this.entity.userPassword.id;
    }
    setUserPasswordId(userPasswordId: number, userPasswordRepository: Repository<UserPassword>) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        let target = userPasswordRepository.create();
        target.id = userPasswordId;
        this.entity.userPassword = target;
    }
    getSessionIds() {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        if (!this.entity.sessions) {
            return [];
        }
        return this.entity.sessions.map(v => v.id);
    }

    /**
     * Deletes a the session from the user. Throws an error if the session does not exist
     * @param sessionId 
     */
    deleteSession(sessionId: number) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        if (!this.entity.sessions) {
            throw 'this session does not exist on the user';
        }
        let target = this.entity.sessions.find(s => s.id === sessionId);
        if (!target) {
            throw 'this session does not exist on the user';
        }
        this.entity.sessions.splice(this.entity.sessions.indexOf(target));
    }
}