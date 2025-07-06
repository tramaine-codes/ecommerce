import { Config, Context, Effect, Layer } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { Time } from '../../../../vendor/type/time.js';
import { NotFoundError } from '../../../common/application/error/not-found-error.js';
import { DynamoClient } from '../../../common/vendor/dynamo/dynamo-client.js';
import { ProductDto } from '../../domain/dto/product-dto.js';
import { ProductMapper, ProductMapperLive } from './product-mapper.js';

export class DynamoGateway extends Context.Tag('DynamoGateway')<
  DynamoGateway,
  {
    get: (
      productId: string
    ) => Effect.Effect<ProductDto, NotFoundError | UnknownException>;
    create: (product: ProductDto) => Effect.Effect<void, UnknownException>;
  }
>() {
  static build = () =>
    DynamoGatewayLive.pipe(
      Layer.provide(Layer.merge(DynamoClient.build(), ProductMapperLive))
    );
}

export const DynamoGatewayLive = Layer.effect(
  DynamoGateway,
  Effect.gen(function* () {
    const tableName = yield* Config.string('PRODUCTS_TABLE_NAME');
    const client = yield* DynamoClient;
    const productMapper = yield* ProductMapper;

    return {
      get: (productId) =>
        client.get(tableName, `PRODUCT#${productId}`).pipe(
          Effect.andThen(({ Item }) => Effect.fromNullable(Item)),
          Effect.catchTag(
            'NoSuchElementException',
            () => new NotFoundError('product not found')
          ),
          Effect.andThen((item) => {
            const createdAt = Time.now();
            createdAt.setTime(Date.parse(item.CreatedAt));

            return new ProductDto(
              {
                description: item.Description,
                name: item.Name,
                price: item.Price,
              },
              item.Id,
              createdAt
            );
          })
        ),
      create: (product) =>
        client
          .put(tableName, productMapper.map(product))
          .pipe(Effect.andThen(() => Effect.void)),
    };
  })
);

export const DynamoGatewayTest = Layer.succeed(DynamoGateway, {
  get: (_productId) =>
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
  create: (_product) => Effect.void,
});
