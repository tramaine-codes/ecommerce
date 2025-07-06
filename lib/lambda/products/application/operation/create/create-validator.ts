import { Schema } from '@effect/schema';
import { formatErrorSync } from '@effect/schema/ArrayFormatter';
import { Context, Effect, Layer, pipe } from 'effect';
import { SafeJson } from '../../../../../vendor/type/safe-json.js';
import { ValidationError } from '../../../../common/application/error/validation-error.js';
import type { RequestParams } from '../../../../common/request/request-params.js';
import { CreateProductSchema } from '../../../domain/model/product.js';
import { ProductEvent } from '../../event/product-event.js';
import { Probe } from '../../probe/probe.js';
import type { Validator } from '../operation.js';

export class CreateValidator extends Context.Tag('CreateValidator')<
  CreateValidator,
  Validator
>() {
  static build = () => CreateValidatorLive;
}

export const CreateValidatorLive = Layer.effect(
  CreateValidator,
  Effect.gen(function* () {
    const probe = yield* Probe;

    return {
      validate: ({ body }: RequestParams) =>
        SafeJson.parse(body).pipe(
          Effect.orElseSucceed(() => ({})),
          Effect.andThen((data) =>
            pipe(
              data,
              Schema.decodeUnknown(CreateProductSchema, { errors: 'all' })
            )
          ),
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
          Effect.andThen((product) => ({
            event: ProductEvent.CREATE_PRODUCT,
            product,
          }))
        ),
    };
  })
);

export const CreateValidatorTest = Layer.succeed(CreateValidator, {
  validate: (_params: RequestParams) =>
    Effect.succeed({
      event: ProductEvent.CREATE_PRODUCT,
      product: {
        description: 'foo',
        name: 'bar',
        price: '9.99',
      },
    }),
});
