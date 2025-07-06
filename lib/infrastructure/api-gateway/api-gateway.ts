import { Context, Effect, Layer } from 'effect';
import { NoSuchElementException, type UnknownException } from 'effect/Cause';
import { ApiGatewayClient } from '../../vendor/aws/api-gateway/api-gateway-client.js';

export class ApiGateway extends Context.Tag('ApiGateway')<
  ApiGateway,
  {
    apiId(
      apiName: string
    ): Effect.Effect<string, NoSuchElementException | UnknownException>;
  }
>() {
  static build = () =>
    ApiGatewayLive.pipe(Layer.provide(ApiGatewayClient.build()));
}

export const ApiGatewayLive = Layer.effect(
  ApiGateway,
  Effect.gen(function* () {
    const client = yield* ApiGatewayClient;

    return {
      apiId: (apiName: string) =>
        client
          .restApi(apiName)
          .pipe(
            Effect.andThen(({ id }) =>
              Effect.fromNullable(id).pipe(
                Effect.catchTag(
                  'NoSuchElementException',
                  () =>
                    new NoSuchElementException(
                      `api named ${apiName} found but does not have an id`
                    )
                )
              )
            )
          ),
    };
  })
);
