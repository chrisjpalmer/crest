/** BOILERPLATE - don't touch unless you are brave */
import { Get, BadRequestException } from '@nestjs/common';
import { IsEnum, IsArray } from 'class-validator';
import { transformAndValidate } from 'class-transformer-validator';
import { IndexedData } from '..';

export const SyncDataValidate = 'SyncDataValidate';

const farmhash = require('farmhash');

/**
 * SyncHash, SyncData, SyncResponse
 * These are all response level objects
 */

export class SyncHash {
  id: number;
  hash: string;

  constructor(id: number, ...hashMaterial: any[]) {
    this.id = id;
    let _hashMaterial = '';
    _hashMaterial += id;
    hashMaterial.forEach(h => {
      try {
        _hashMaterial += h.toString();
      } catch (e) {
        try {
          _hashMaterial += JSON.stringify(h);
        } catch (e) {
          throw 'SyncHash: data cannot be hashed';
        }
      }
    });
    this.hash = farmhash.hash64(_hashMaterial);
  }
}

export class SyncListOutput {
  hashes: SyncHash[];
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

export class Sync {
  ids: number[];
  mode: SyncMode;
  validation: string;
}

export class SyncInput {
  sync: Sync;
}
