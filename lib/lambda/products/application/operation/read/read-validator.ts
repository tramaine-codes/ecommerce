import { formatErrorSync } from '@effect/schema/ArrayFormatter';
import * as S from '@effect/schema/Schema';
import { Context, Effect, Layer, pipe } from 'effect';
import { ValidationError } from '../../../../common/application/error/validation-error.js';
import type { RequestParams } from '../../../../common/request/request-params.js';
import { ProductEvent } from '../../event/product-event.js';
import { Probe } from '../../probe/probe.js';
import type { Validator } from '../operation.js';

export class ReadValidator extends Context.Tag('ReadValidator')<
  ReadValidator,
  Validator
>() {
  static build = () => ReadValidatorLive;
}

export const ReadValidatorLive = Layer.effect(
  ReadValidator,
  Effect.gen(function* () {
    const probe = yield* Probe;

    return {
      validate: ({ parameters }: RequestParams) =>
        pipe(
          parameters,
          S.decodeUnknown(ReadProductArgsSchema, { errors: 'all' }),
          Effect.mapError(
            (error) =>
              new ValidationError(
                formatErrorSync(error).map(({ message, path }) => ({
                  message,
                  path,
                }))
              )
          ),
          Effect.tapBoth({
            onFailure: probe.argsValidationFailed,
            onSuccess: probe.argsValidationSucceeded,
          }),
          Effect.andThen(({ productId }) => ({
            event: ProductEvent.READ_PRODUCT,
            productId,
          }))
        ),
    };
  })
);

export const ReadValidatorTest = Layer.succeed(ReadValidator, {
  validate: (_params: RequestParams) =>
    Effect.succeed({
      event: ProductEvent.READ_PRODUCT,
      productId: 'foo',
    }),
});

const ReadProductArgsSchema = S.Struct({
  productId: S.String,
});
