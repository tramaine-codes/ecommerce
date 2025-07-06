import { Effect, Layer } from 'effect';
import type { RequestParams } from '../../../../common/request/request-params.js';
import { Probe } from '../../probe/probe.js';
import { Operation } from '../operation.js';
import { CreateHandler } from './create-handler.js';
import { CreateValidator } from './create-validator.js';

// biome-ignore lint/complexity/noStaticOnlyClass: overriding rule
export class CreateOperation {
  static build = () =>
    CreateOperationLive.pipe(
      Layer.provide(Layer.merge(CreateValidator.build(), CreateHandler.build()))
    );
}

export const CreateOperationLive = Layer.effect(
  Operation,
  Effect.gen(function* () {
    const validator = yield* CreateValidator;
    const handler = yield* CreateHandler;
    const probe = yield* Probe;

    return {
      exec: (params: RequestParams) =>
        probe.validRequestReceived().pipe(
          Effect.andThen(() => validator.validate(params)),
          Effect.andThen(handler.exec)
        ),
    };
  })
);

export const CreateOperationTest = Layer.succeed(Operation, {
  exec: (_params: RequestParams) => Effect.succeed({ productId: 'foo' }),
});
