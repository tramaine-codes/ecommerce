import { Context, Effect, Layer } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { OAuthClient } from '../../vendor/oauth/oauth-client.js';

export class OAuthGateway extends Context.Tag('OAuthGateway')<
  OAuthGateway,
  {
    accessToken(
      issuer: string,
      clientId: string,
      clientSecret: string
    ): Effect.Effect<string, UnknownException>;
  }
>() {
  static build = () =>
    OAuthGatewayLive.pipe(Layer.provide(OAuthClient.build()));
}

export const OAuthGatewayLive = Layer.effect(
  OAuthGateway,
  Effect.gen(function* () {
    const client = yield* OAuthClient;

    return {
      accessToken: (issuer: string, clientId: string, clientSecret: string) =>
        client.accessToken(issuer, clientId, clientSecret),
    };
  })
);
