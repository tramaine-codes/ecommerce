import { Context, Effect, Layer } from 'effect';
import { NoSuchElementException, type UnknownException } from 'effect/Cause';
import { CognitoClient } from '../../vendor/aws/cognito/cognito-client.js';

export class CognitoGateway extends Context.Tag('CognitoGateway')<
  CognitoGateway,
  {
    credentials(
      userPoolName: string,
      userPoolClientName: string
    ): Effect.Effect<
      {
        clientId: string;
        clientSecret: string;
        userPoolId: string;
      },
      NoSuchElementException | UnknownException
    >;
  }
>() {
  static build() {
    return CognitoGatewayLive.pipe(Layer.provide(CognitoClient.build()));
  }
}

export const CognitoGatewayLive = Layer.effect(
  CognitoGateway,
  Effect.gen(function* () {
    const client = yield* CognitoClient;

    return {
      credentials: (userPoolName: string, userPoolClientName: string) => {
        return Effect.Do.pipe(
          Effect.bind('userPool', () => client.userPool(userPoolName)),
          Effect.bind('userPoolId', ({ userPool: { Id } }) =>
            Effect.fromNullable(Id)
          ),
          Effect.catchTag(
            'NoSuchElementException',
            () =>
              new NoSuchElementException(
                `user pool id for ${userPoolName} not found`
              )
          ),
          Effect.bind('userPoolClient', ({ userPoolId }) =>
            client.userPoolClient(userPoolId, userPoolClientName)
          ),
          Effect.bind('clientId', ({ userPoolClient: { ClientId } }) =>
            Effect.fromNullable(ClientId).pipe(
              Effect.catchTag('NoSuchElementException', () =>
                Effect.fail(
                  new NoSuchElementException(
                    `client id for ${userPoolClientName} not found`
                  )
                )
              )
            )
          ),
          Effect.bind('userPoolClientDetails', ({ clientId, userPoolId }) =>
            client.describePoolClient(clientId, userPoolId)
          ),
          Effect.bind(
            'clientSecret',
            ({ userPoolClientDetails: { ClientSecret } }) =>
              Effect.fromNullable(ClientSecret).pipe(
                Effect.catchTag(
                  'NoSuchElementException',
                  () =>
                    new NoSuchElementException(
                      `client secret for ${userPoolClientName} not found`
                    )
                )
              )
          ),
          Effect.andThen(({ clientId, clientSecret, userPoolId }) => ({
            clientId,
            clientSecret,
            userPoolId,
          }))
        );
      },
    };
  })
);
