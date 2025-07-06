import {
  APIGatewayClient,
  paginateGetRestApis,
  type RestApi,
} from '@aws-sdk/client-api-gateway';
import { Array as Arr, Context, Effect, Layer, Match, Stream } from 'effect';
import { NoSuchElementException, UnknownException } from 'effect/Cause';

export class ApiGatewayClient extends Context.Tag('ApiGatewayClient')<
  ApiGatewayClient,
  {
    restApi(
      restApiame: string
    ): Effect.Effect<RestApi, NoSuchElementException | UnknownException>;
  }
>() {
  static build = () => ApiGatewayClientLive;
}

class Client {
  constructor(private readonly client: APIGatewayClient) {}

  restApi(restApiName: string) {
    return this.restApis().pipe(
      Effect.andThen((restApis) =>
        Arr.findFirst(restApis, ({ tags }) =>
          Match.value(tags).pipe(
            Match.when(Match.undefined, () => false),
            Match.orElse((tags) => tags.Name === restApiName)
          )
        )
      ),
      Effect.catchTag(
        'NoSuchElementException',
        () =>
          new NoSuchElementException(`rest api named ${restApiName} not found`)
      )
    );
  }

  private restApis() {
    return Stream.fromAsyncIterable(
      paginateGetRestApis(
        {
          client: this.client,
        },
        {}
      ),
      (e) => new UnknownException(e)
    ).pipe(
      Stream.runFold([] as RestApi[], (allRestApis, { items }) =>
        Match.value(items).pipe(
          Match.when(Match.undefined, () => allRestApis),
          Match.orElse((restApis) => [...allRestApis, ...restApis])
        )
      )
    );
  }
}

export const ApiGatewayClientLive = Layer.succeed(
  ApiGatewayClient,
  new Client(new APIGatewayClient())
);

export const ApiGatewayClientSuccessTest = Layer.succeed(ApiGatewayClient, {
  restApi: (_restApiName: string) =>
    Effect.succeed({
      id: 'foo',
    }),
});

export const ApiGatewayClientFailureTest = Layer.succeed(ApiGatewayClient, {
  restApi: (_restApiName: string) => Effect.succeed({}),
});
