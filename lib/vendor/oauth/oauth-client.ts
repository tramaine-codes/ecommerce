import { Context, Effect, Layer } from 'effect';
import type { UnknownException } from 'effect/Cause';
import * as client from 'openid-client';

export class OAuthClient extends Context.Tag('OAuthClient')<
  OAuthClient,
  {
    accessToken(
      issuer: string,
      clientId: string,
      clientSecret: string
    ): Effect.Effect<string, UnknownException>;
  }
>() {
  static build = () => OAuthClientLive;
}

export const OAuthClientLive = Layer.succeed(OAuthClient, {
  accessToken: (issuer: string, clientId: string, clientSecret: string) =>
    Effect.tryPromise(() =>
      client.discovery(new URL(issuer), clientId, clientSecret)
    ).pipe(
      Effect.andThen((config) => client.clientCredentialsGrant(config)),
      Effect.andThen((response) => response.access_token)
    ),
});

export const OAuthClientSuccessTest = Layer.succeed(OAuthClient, {
  accessToken: (_issuer: string, _clientId: string, _clientSecret: string) =>
    Effect.succeed('foo'),
});
