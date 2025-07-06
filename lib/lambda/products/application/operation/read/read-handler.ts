import { Context, Effect, Layer } from 'effect';
import { Time } from '../../../../../vendor/type/time.js';
import { ServiceError } from '../../../../common/application/error/service-error.js';
import { ProductDto } from '../../../domain/dto/product-dto.js';
import type { ProductEvent } from '../../event/product-event.js';
import { ProductService } from '../../service/product-service.js';
import type { Handler } from '../operation.js';

export interface ReadArgs {
  readonly event: typeof ProductEvent.READ_PRODUCT;
  readonly productId: string;
}

export class ReadHandler extends Context.Tag('Handler')<
  ReadHandler,
  Handler
>() {
  static build = () =>
    ReadHandlerLive.pipe(Layer.provide(ProductService.build()));
}

export const ReadHandlerLive = Layer.effect(
  ReadHandler,
  Effect.gen(function* () {
    const productService = yield* ProductService;

    return {
      exec: (args: ReadArgs) =>
        productService.read(args).pipe(
          Effect.catchTag('UnknownException', (error) =>
            Effect.fail(new ServiceError(error))
          ),
          Effect.andThen((productDto) => productDto.toJSON())
        ),
    };
  })
);

export const ReadHandlerTest = Layer.succeed(ReadHandler, {
  exec: (_args: ReadArgs) =>
    Effect.succeed(
      new ProductDto(
        {
          description: 'foo',
          name: 'bar',
          price: '9.99',
        },
        'baz',
        Time.now()
      ).toJSON()
    ),
});
