import { identity, Match, Option } from 'effect';
import type { RequestParams } from '../../../common/request/request-params.js';
import { CreateOperation } from './create/create-operation.js';
import { InvalidOperationLive } from './invalid/invalid-operation.js';
import { ReadOperation } from './read/read-operation.js';

// biome-ignore lint/complexity/noStaticOnlyClass: overriding rule
export class OpFactory {
  static from = ({ httpMethod }: RequestParams) =>
    Match.value(httpMethod).pipe(
      Match.when('POST', () => CreateOperation.build()),
      Match.when('GET', () => ReadOperation.build()),
      Match.option,
      Option.match({
        onNone: () => InvalidOperationLive,
        onSome: identity,
      })
    );
}
