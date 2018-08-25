/** BOILERPLATE - don't touch unless you are brave */

import { IncomingMessage } from 'http';
import { UserServiceOutput } from '../entity.service/service.output';

export class CoreRequest extends IncomingMessage {
  user: UserServiceOutput;
}

/**
 * Pass an array of promises to this function. It will await on all of them.
 * If one of them fails it will catch the exception and await on all other promises.
 * Then it will throw an array of exceptions which occurred.
 * If no errors occurred the function returns an array of return values (as a Promise).
 * @param promises the promises to await on
 */
export async function awaitPromiseArray<T>(promises: Promise<T>[]): Promise<{value:T, error:Error}[]> {
  let results: {value:T, error:Error}[] = [];
  for (var i = 0; i < promises.length; i++) {
    try {
      results.push({value: await promises[i], error:null});
    } catch (e) {
      results.push({value: null, error: e});
    }
  }

  return results;
}

export type IndexedData = Object;

export function mapToIndexedData<T, Q>(map: Map<T, Q>): IndexedData {
  return mapToObject(map);
}

export function mapToObject<T, Q>(map: Map<T, Q>) {
  let obj = Object.create(null);
  for (let [k, v] of map) {
    // We don’t escape the key '__proto__'
    // which can cause problems on older engines
    obj['' + k] = v;
  }
  return obj;
}
