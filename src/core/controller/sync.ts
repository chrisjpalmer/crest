/** BOILERPLATE - don't touch unless you are brave */
import { IndexedData } from '../core/core.util';
import { STRINGIFY } from './stringify';

export const SyncDataValidate = 'SyncDataValidate';

const farmhash = require('farmhash');

export enum GenericSyncMode {
  All,
  Discrete,
  ParameterSearch,
}

/**
 * SyncHash, SyncData, SyncResponse
 * These are all response level objects
 */

export class SyncHash<T> {
  id: T;
  hash: string;

  constructor(id: T, updatedAt: Date, ...hashFodder: any[]) {
    this.id = id;
    let hashMaterial = '';
    hashMaterial += STRINGIFY(id);
    hashMaterial += updatedAt.toISOString(); //The most precise form of the date which can be retrieved.

    hashFodder.forEach(fodder => {
      try {
        hashMaterial += fodder.toString();
      } catch (e) {
        try {
          hashMaterial += STRINGIFY(fodder);
        } catch (e) {
          throw 'SyncHash: data cannot be hashed';
        }
      }
    });

    this.hash = farmhash.hash64(hashMaterial);
  }
}

export class SyncListOutput<T> {
  hashes: SyncHash<T>[];
  validation: string;
}

export class SyncDataOutput {
  data: IndexedData;
}

/**
 * SyncMode, Sync
 * These are all request level objects
 */

export enum SyncMode {
  List,
  Data,
}

export class Sync<T> {
  ids: T[];
  mode: SyncMode;
  validation: string;
}

export class GenericSyncInput<T> {
  sync: Sync<T>;
}
