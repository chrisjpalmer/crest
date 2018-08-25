import { GenericModel, GenericModelActions } from "./generic.model";
import { Session } from "./session.entity";
import { Repository } from "typeorm";
import { User } from "./user.entity";

export class SessionResult {
    session:SessionModel;
    token:string;
}

export class SessionModel extends GenericModel<Session> implements GenericModelActions {
    constructor(entity: Session, private sessionRepository: Repository<Session>) {
        super(entity, 'SessionModel');
    }

    /**
     * Factories
     */

    static createNew(sessionRepository: Repository<Session>) {
        let session: Session = sessionRepository.create();
        return new SessionModel(session, sessionRepository);
    }

    static async forSessionId(sessionId:number, sessionRepository:Repository<Session>) {
        let session: Session = null;
        try {
            session = await sessionRepository.createQueryBuilder('session')
            .leftJoin('session.user', 'user')
            .addSelect('user.id')
            .where('session.id = :sessionId', {sessionId})
            .getOne();
        } finally { }

        if (!session) {
            throw `session object does not exist for ${sessionId}`;
        }

        return new SessionModel(session, sessionRepository);
    }

    /**
     * Actions
     */

    async save() {
        this.updateUpdatedAt();
        await this.sessionRepository.save(this.entity);
        return this.entity.id;
    }

    async delete() {
        await this.sessionRepository.delete(this.entity);
    }

    /**
     * Data getters and setters
     */

    isExpired(expiryInterval:number) {
        let expired = this.entity.lastUsed.getTime() + expiryInterval * 1000 < new Date().getTime();
        return expired;
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

    setUserId(userId:number, userRepository:Repository<User>) {
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        let target = userRepository.create();
        target.id = userId;
        this.entity.user = target;
    }

    updateLastUsed() {
        if(!this.entity) {
            this.throwEntityNotSet();
        }
        this.entity.lastUsed = new Date();
    }
}