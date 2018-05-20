/** BOILERPLATE - don't touch unless you are brave */
import { IsNotNull } from './validator';
import {
  SyncResponse,
  SyncHash,
  Sync,
  SyncData,
  SyncMode,
  SyncDataValidate,
  SyncInput,
} from './sync';
import {
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { BadRequestException } from '@nestjs/common';
import { GenericEntityService } from '../entity.service/generic.entity.service';
import { IndexedData, mapToIndexedData } from '..';

export const Discrete = 'Discrete';
export const ParameterSearch = 'ParameterSearch';
export const Pagination = 'Pagination';

export enum GenericGetMode {
  All,
  Discrete,
  ParameterSearch,
}

//TODO: Generlize this class for all entities
export class GenericGetParameterSearch {
  //Search parameters are allowed to be undefined BUT not null - undefined, represents not being included in the search
  @IsNotNull() firstName: string;
  @IsNotNull() lastName: string;
  @IsNotNull() username: string;
}

//TODO: Reapply the validation through custom validation schema
export class GenericGetInput extends SyncInput {
  //Query Mode
  mode: GenericGetMode;

  //Discrete Mode
  ids: number[];

  //ParameterSearch Mode
  parameterSearch: GenericGetParameterSearch;

  //Pagination
  page: number;

  pageSize: number;
}

//Output
export class GenericGetOutput<T> {
  result: IndexedData;
}

/**
 * Generic class GenericGetController implements common get web service
 * functionality in a single generic class.
 * Override this class, define the Get() method AND make a call to this.handleGet()
 *
 * Most get methods to a large dataset require a syncing protocol,
 * pagination, various methods of query etc. GenericGetController's handleGet method
 * accepts an input of type GenericGetInput which supports a protocol for doing this
 */
export class GenericGetController<T> {
  constructor(private dataService: GenericEntityService<T>) {}

  /**
   * handleGet is the entry point for the get request handling.
   * it's job is to work out what kind of sync mode the client is in:
   * 1) List - fetch the list of hashes which pertain to the query I want to make
   * 2) Data - client sends a list of ids it doesn't have and server provides full data back
   *
   * You do not need to use GenericGetController to implement sync protocol
   * if your needs are more custom, it may be in your interests to duplicate code within this class
   * and implement it yourself.
   * @param input
   */
  protected async handleGet(
    input: GenericGetInput,
  ): Promise<GenericGetOutput<T>> {
    let response = await this._handleGet(input);
    return { result: mapToIndexedData(<Map<any, any>>response) };
  }

  private async _handleGet(input: GenericGetInput): Promise<SyncResponse<T>> {
    if (input.sync.mode == SyncMode.List) {
      return await this.handleList(input);
    }
    try {
      await transformAndValidate(Sync, input.sync, {
        validator: { groups: [SyncDataValidate] },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
    return await this.handleData(input.sync);
  }

  /**
   * handleList is used when the sync mode is List
   * it processes the conditions provided and performs the query, only returning a SyncHash map to the object.
   * A SyncHash map contains id to hash mappings (called a SyncRaw object).
   * the client will use this information to download whatever objects it does not have,
   * or whichever are out of date.
   * @param input
   */
  protected async handleList(input: GenericGetInput): Promise<SyncHash> {
    let validateInput = async (validateGrp: string) => {
      try {
        await transformAndValidate(GenericGetInput, input, {
          validator: { groups: [validateGrp] },
        });
      } catch (e) {
        throw new BadRequestException(
          e,
          `validation failed for input group ${validateGrp}`,
        );
      }
    };

    if (input.page !== undefined) {
      await validateInput(Pagination);
    }
    let result: Promise<SyncHash>;
    switch (input.mode) {
      case GenericGetMode.All:
        result = this.dataService.findSyncHash(
          null,
          input.page,
          input.pageSize,
        );
        break;
      case GenericGetMode.Discrete:
        await validateInput(Discrete);
        result = this.dataService.findSyncHash(
          input.ids,
          input.page,
          input.pageSize,
        );
        break;
      case GenericGetMode.ParameterSearch:
        await validateInput(ParameterSearch);
        result = this.dataService.findSyncHash(
          s => {
            return s.where(input.parameterSearch);
          },
          input.page,
          input.pageSize,
        );
        break;
    }
    return result;
  }

  /**
   * The handleData method is called when sync mode is Data
   * Its job is to basically retrieve full objects for the ids which the client has requested
   * handleData is invoked once the client has decided which items it needs to update based on the
   * syncHash result.
   * @param sync
   */
  protected async handleData(sync: Sync): Promise<SyncData<T>> {
    return this.dataService.findIndexed(sync.ids);
  }
}
