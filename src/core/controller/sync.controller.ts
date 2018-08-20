import {
  GenericSyncInput,
  SyncMode,
  SyncHash,
  SyncListOutput,
  Sync,
  SyncDataOutput,
} from './sync';
import { IndexSet } from '../core/core.database.util';
import { mapToIndexedData, CoreRequest } from '../core/core.util';
import { GenericOutput } from 'database';
import { ConfigService } from '../service/config.service';
const jwt = require('jsonwebtoken');

export class SyncJWT {
  ids: number[];
}

/**
 * Generic class SyncController implements common get web service
 * functionality in a single generic class.
 * Override this class, define the @Post() method AND make a call to this.handleSync()
 *
 * Most get methods to a large dataset require a syncing protocol,
 * pagination, various methods of query etc. SyncController's handleSync method
 * accepts an input of type GenericSyncInput which supports a protocol for doing this
 */
export class SyncController<T> {
  constructor(private configService: ConfigService) {}

  /**
   * handleSync is the entry point for the get request handling.
   * it's job is to work out what kind of sync mode the client is in:
   * 1) List - fetch the list of hashes which pertain to the query I want to make
   * 2) Data - client sends a list of ids it doesn't have and server provides full data back
   *
   * You do not need to use SyncController to implement sync protocol
   * if your needs are more custom, it may be in your interests to duplicate code within this class
   * and implement it yourself.
   * @param input
   */

  async handleSync(input: GenericSyncInput, req:CoreRequest): Promise<SyncListOutput | SyncDataOutput> {
    if (input.sync.mode == SyncMode.List) {
      return this._handleList(input, req);
    }

    return this._handleData(input.sync, req);
  }

  /**
   * handleList is used when the sync mode is List
   * it processes the conditions provided and performs the query, only returning a SyncHash map to the object.
   * A SyncHash map contains id to hash mappings (called a SyncRaw object).
   * the client will use this information to download whatever objects it does not have,
   * or whichever are out of date.
   * @param input
   */
  private async _handleList(input: GenericSyncInput, req:CoreRequest): Promise<SyncListOutput> {
    let resultIds = await this.handleList(input,req);
    return { hashes: resultIds, validation: await this.authorize(resultIds) };
  }

  protected async handleList(input: GenericSyncInput, req:CoreRequest): Promise<SyncHash[]> {
    return null;
  }

  /**
   * The handleData method is called when sync mode is Data
   * Its job is to basically retrieve full objects for the ids which the client has requested
   * handleData is invoked once the client has decided which items it needs to update based on the
   * syncHash result.
   * @param sync
   */
  private async _handleData(sync: Sync, req:CoreRequest): Promise<SyncDataOutput> {
    await this.validate(sync.ids, sync.validation);

    let resultData = await this.handleData(sync.ids, req);
    let mappedData = IndexSet(resultData, v => v.id);
    let indexedData = mapToIndexedData(mappedData);
    return { data: indexedData };
  }

  protected async handleData(ids: number[], req:CoreRequest): Promise<GenericOutput[]> {
    return null;
  }

  /**
   * validation/authorization todo:
   */

  authorize(ids: SyncHash[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let payload: SyncJWT = { ids: ids.map(v => v.id) };
      let token: string = jwt.sign(
        payload,
        this.configService.auth.key,
        (err, token) => {
          if (!!err) {
            reject(err);
          }

          resolve(token);
        },
      );
    });
  }

  validate(ids: number[], token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      jwt.verify(
        token,
        this.configService.auth.key,
        (err, payload: SyncJWT) => {
          if (!!err) {
            reject(err);
            return;
          }

          //some are not in?
          let someIdsNotIn = ids.some(id => {
            if (payload.ids.indexOf(id) === -1) {
              return true; // This id is not in the payload of authorized ids
            }
          });

          if (someIdsNotIn) {
            reject('requested object ids are not authorized by the jwt token');
            return;
          }

          resolve();
        },
      );
    });
  }
}
