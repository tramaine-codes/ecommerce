import { Context, Effect, Layer } from 'effect';
import { ServiceError } from '../../../../common/application/error/service-error.js';
import type { Product } from '../../../domain/model/product.js';
import type { ProductEvent } from '../../event/product-event.js';
import { ProductService } from '../../service/product-service.js';
import type { Handler } from '../operation.js';

export interface CreateArgs {
  readonly event: typeof ProductEvent.CREATE_PRODUCT;
  readonly product: Product;
}

export class CreateHandler extends Context.Tag('Handler')<
  CreateHandler,
  Handler
>() {
  static build = () =>
    CreateHandlerLive.pipe(Layer.provide(ProductService.build()));
}

export const CreateHandlerLive = Layer.effect(
  CreateHandler,
  Effect.gen(function* () {
    const productService = yield* ProductService;

    return {
      exec: (args: CreateArgs) =>
        productService.create(args).pipe(
          Effect.mapError((error) => new ServiceError(error)),
          Effect.andThen((id) => ({ id }))
        ),
    };
  })
);

export const CreateHandlerTest = Layer.succeed(CreateHandler, {
  exec: (_args: CreateArgs) => Effect.succeed({ id: 'foo' }),
});
