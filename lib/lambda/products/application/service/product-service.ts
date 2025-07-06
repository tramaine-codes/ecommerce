import { Context, Effect, Layer } from 'effect';
import { UnknownException } from 'effect/Cause';
import { IdGenerator } from '../../../../vendor/id/id-generator.js';
import { Time } from '../../../../vendor/type/time.js';
import type { NotFoundError } from '../../../common/application/error/not-found-error.js';
import { ProductDto } from '../../domain/dto/product-dto.js';
import { DynamoGateway } from '../../infrastructure/persistence/dynamo-gateway.js';
import type { CreateArgs } from '../operation/create/create-handler.js';
import type { ReadArgs } from '../operation/read/read-handler.js';
import { Probe } from '../probe/probe.js';

export class ProductService extends Context.Tag('ProductService')<
  ProductService,
  {
    create: (args: CreateArgs) => Effect.Effect<string, UnknownException>;
    read: (
      args: ReadArgs
    ) => Effect.Effect<ProductDto, NotFoundError | UnknownException>;
  }
>() {
  static build = () =>
    ProductServiceLive.pipe(Layer.provide(DynamoGateway.build()));
}

export const ProductServiceLive = Layer.effect(
  ProductService,
  Effect.gen(function* () {
    const dynamoGateway = yield* DynamoGateway;
    const probe = yield* Probe;

    return {
      create: ({ product }: CreateArgs) => {
        const productId = IdGenerator.generate();

        return dynamoGateway
          .create(new ProductDto(product, productId, Time.now()))
          .pipe(
            Effect.tapBoth({
              onFailure: probe.savingProductToDynamoFailed,
              onSuccess: probe.savingProductToDynamoSucceeded,
            }),
            Effect.andThen(() => productId)
          );
      },
      read: ({ productId }: ReadArgs) =>
        dynamoGateway.get(productId).pipe(
          Effect.tapBoth({
            onFailure: probe.readingProductFromDynamoFailed,
            onSuccess: probe.readingProductFromDynamoSucceeded,
          })
        ),
    };
  })
);

export const ProductServiceSuccessTest = Layer.succeed(ProductService, {
  create: (_args: CreateArgs) => Effect.succeed('foo'),
  read: (_args: ReadArgs) =>
    Effect.succeed(
      new ProductDto(
        {
          description: 'foo',
          name: 'bar',
          price: '9.99',
        },
        'baz',
        Time.now()
      )
    ),
});

export const ProductServiceFailureTest = Layer.succeed(ProductService, {
  create: (_args: CreateArgs) => Effect.fail(new UnknownException('foo')),
  read: (_args: ReadArgs) => Effect.fail(new UnknownException('foo')),
});
