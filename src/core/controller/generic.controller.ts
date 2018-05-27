import { GenericEntityService } from '../entity.service/generic.entity.service';
import {
  SyncInput,
  SyncMode,
  SyncHash,
  SyncListOutput,
  Sync,
  SyncDataOutput,
} from './sync';
import { IndexSet } from '../core/core.database.util';
import { mapToIndexedData } from '../core/core.util';
import { GenericEntity } from 'database';
import { ConfigService } from '..';
const jwt = require('jsonwebtoken');

export class SyncJWT {
  ids: number[];
}

/**
 * Generic class GenericController implements common get web service
 * functionality in a single generic class.
 * Override this class, define the Get() method AND make a call to this.handleGet()
 *
 * Most get methods to a large dataset require a syncing protocol,
 * pagination, various methods of query etc. GenericController's handleGet method
 * accepts an input of type SyncInput which supports a protocol for doing this
 */
export class GenericController<T> {
  constructor(private configService: ConfigService) {}

  /**
   * handleGet is the entry point for the get request handling.
   * it's job is to work out what kind of sync mode the client is in:
   * 1) List - fetch the list of hashes which pertain to the query I want to make
   * 2) Data - client sends a list of ids it doesn't have and server provides full data back
   *
   * You do not need to use GenericController to implement sync protocol
   * if your needs are more custom, it may be in your interests to duplicate code within this class
   * and implement it yourself.
   * @param input
   */

  async handleGet(input: SyncInput): Promise<SyncListOutput | SyncDataOutput> {
    if (input.sync.mode == SyncMode.List) {
      return this._handleList(input);
    }

    return this._handleData(input.sync);
  }

  /**
   * handleList is used when the sync mode is List
   * it processes the conditions provided and performs the query, only returning a SyncHash map to the object.
   * A SyncHash map contains id to hash mappings (called a SyncRaw object).
   * the client will use this information to download whatever objects it does not have,
   * or whichever are out of date.
   * @param input
   */
  private async _handleList(input: SyncInput): Promise<SyncListOutput> {
    let resultIds = await this.handleList(input);
    return { hashes: resultIds, validation: await this.authorize(resultIds) };
  }

  protected async handleList(input: SyncInput): Promise<SyncHash[]> {
    return null;
  }

  /**
   * The handleData method is called when sync mode is Data
   * Its job is to basically retrieve full objects for the ids which the client has requested
   * handleData is invoked once the client has decided which items it needs to update based on the
   * syncHash result.
   * @param sync
   */
  private async _handleData(sync: Sync): Promise<SyncDataOutput> {
    this.validate(sync.ids, sync.validation);

    let resultData = await this.handleData(sync.ids);
    let mappedData = IndexSet(resultData, v => v.id);
    let indexedData = mapToIndexedData(mappedData);
    return { data: indexedData };
  }

  protected async handleData(ids: number[]): Promise<GenericEntity[]> {
    return null;
  }

  /**
   * validation/authorization todo:
   */

  authorize(ids: SyncHash[]): Promise<string> {
    if (this.configService.app.debug) {
      return new Promise(resolve => {
        resolve('');
      });
    }

    return new Promise((resolve, reject) => {
      let payload: SyncJWT = { ids: ids.map(v => v.id) };
      let token: string = jwt.sign(
        payload,
        this.configService.auth.key,
        (err, token) => {
          if (!!err) {
            reject(err);
          }
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
