import { GenericModel, GenericModelActions } from "./generic.model";
import { RequestLog } from "./request.log.entity";
import { Repository } from "typeorm";
import { User } from "./user.entity";

//TODO: private constructors
//TODO: check for entity on save and delete
export class RequestLogModel extends GenericModel<RequestLog> implements GenericModelActions {
    constructor(entity: RequestLog, private requestLogRepository: Repository<RequestLog>) {
        super(entity, 'RequestLogModel');
    }

    /**
     * Factories
     */

    static createNew(requestLogRepository: Repository<RequestLog>) {
        let requestLog: RequestLog = requestLogRepository.create();
        return new RequestLogModel(requestLog, requestLogRepository);
    }

    static async forRequestLogId(requestLogId: number, requestLogRepository: Repository<RequestLog>) {
        let requestLog: RequestLog = null;
        try {
            requestLog = await requestLogRepository.createQueryBuilder('requestLog')
                .leftJoin('requestLog.user', 'user')
                .addSelect('user.id')
                .where('requestLog.id = :requestLogId', { requestLogId })
                .getOne();
        } finally { }

        if (!requestLog) {
            throw `requestLog object does not exist for ${requestLogId}`;
        }

        return new RequestLogModel(requestLog, requestLogRepository);
    }

    /**
     * Actions
     */

    async save() {
        this.updateUpdatedAt();
        await this.requestLogRepository.save(this.entity);
        return this.entity.id;
    }

    async delete() {
        await this.requestLogRepository.delete(this.entity);
    }

    /**
     * Data getters and setters
     */

    setPreRequest(startTime:Date, ipAddress: string, uri: string) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        this.entity.startTime = startTime;
        this.entity.uri = uri;
        this.entity.ipAddress = ipAddress;
    }

    setPreRequestWithUser(startTime:Date, ipAddress: string, uri: string, userId: number, userRepository: Repository<User>) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        this.setPreRequest(startTime, ipAddress, uri);
        if (!!userId) {
            this.entity.user = userRepository.create();
            this.entity.user.id = userId;
        }
    }

    setPostRequestException(endTime:Date, duration:number, error:string) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        this.setPostRequest(endTime, duration)
        this.entity.error = error
    }

    setPostRequest(endTime:Date, duration:number, ) {
        if (!this.entity) {
            this.throwEntityNotSet();
        }
        this.entity.endTime = endTime;
        this.entity.duration = duration;
    }
}