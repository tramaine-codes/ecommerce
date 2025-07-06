import type { APIGatewayProxyResult } from 'aws-lambda';
import { Context, Effect, flow, Layer, Match } from 'effect';
import { RequestContext } from '../../common/request/request-context.js';
import type { RequestParams } from '../../common/request/request-params.js';
import { Response } from '../../common/response/response.js';
import { OpFactory } from '../application/operation/op-factory.js';
import { Operation } from '../application/operation/operation.js';
import { Probe } from '../application/probe/probe.js';

export class Api extends Context.Tag('Api')<
  Api,
  {
    handler: (params: RequestParams) => Effect.Effect<APIGatewayProxyResult>;
  }
>() {
  static from = (params: RequestParams) =>
    ApiLive.pipe(
      Layer.provide(OpFactory.from(params)),
      Layer.provide(Probe.build())
    );
}

const ApiLive = Layer.effect(
  Api,
  Effect.gen(function* () {
    const operation = yield* Operation;
    const requestContext = yield* RequestContext;
    const requestId = requestContext.requestId;

    return {
      handler: (params) =>
        operation.exec(params).pipe(
          Effect.match({
            onFailure: flow(
              Match.value,
              Match.tags({
                InvalidOperationError: () => Response.serverError(requestId),
                NotFoundError: () => Response.notFound(requestId),
                ServiceError: () => Response.serverError(requestId),
                ValidationError: ({ issues }) =>
                  Response.badRequest(requestId, { issues }),
              }),
              Match.exhaustive
            ),
            onSuccess: (data) => Response.ok(requestId, data),
          })
        ),
    };
  })
);

export const ApiTest = Layer.succeed(Api, {
  handler: (_params: RequestParams) =>
    Effect.succeed(Response.ok('foo', { bar: 'baz' })),
});
