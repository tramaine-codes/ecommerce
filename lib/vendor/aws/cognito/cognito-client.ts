import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  paginateListUserPoolClients,
  paginateListUserPools,
  type UserPoolClientDescription,
  type UserPoolClientType,
  type UserPoolDescriptionType,
} from '@aws-sdk/client-cognito-identity-provider';
import { Array as Arr, Context, Effect, Layer, Match, Stream } from 'effect';
import { NoSuchElementException, UnknownException } from 'effect/Cause';

export class CognitoClient extends Context.Tag('CognitoClient')<
  CognitoClient,
  {
    userPool(
      userPoolName: string
    ): Effect.Effect<
      UserPoolDescriptionType,
      NoSuchElementException | UnknownException
    >;
    userPoolClient(
      userPoolId: string,
      clientName: string
    ): Effect.Effect<
      UserPoolClientDescription,
      NoSuchElementException | UnknownException
    >;
    describePoolClient(
      clientId: string,
      userPoolId: string
    ): Effect.Effect<
      UserPoolClientType,
      NoSuchElementException | UnknownException
    >;
  }
>() {
  static build = () => CognitoClientLive;
}

class Client {
  constructor(private readonly client: CognitoIdentityProviderClient) {}

  userPool(userPoolName: string) {
    return this.userPools().pipe(
      Effect.andThen((userPools) =>
        Arr.findFirst(userPools, (userPool) => userPool.Name === userPoolName)
      ),
      Effect.catchTag(
        'NoSuchElementException',
        () =>
          new NoSuchElementException(
            `user pool named ${userPoolName} not found`
          )
      )
    );
  }

  userPoolClient(userPoolId: string, clientName: string) {
    return this.userPoolClients(userPoolId).pipe(
      Effect.andThen((userPoolClients) =>
        Arr.findFirst(
          userPoolClients,
          (userPoolClient) => userPoolClient.ClientName === clientName
        )
      ),
      Effect.catchTag(
        'NoSuchElementException',
        () =>
          new NoSuchElementException(
            `user pool client named ${clientName} in user pool ${userPoolId} not found`
          )
      )
    );
  }

  describePoolClient(clientId: string, userPoolId: string) {
    return Effect.tryPromise(() =>
      this.client.send(
        new DescribeUserPoolClientCommand({
          ClientId: clientId,
          UserPoolId: userPoolId,
        })
      )
    ).pipe(
      Effect.andThen(({ UserPoolClient }) =>
        Effect.fromNullable(UserPoolClient)
      ),
      Effect.catchTag(
        'NoSuchElementException',
        () =>
          new NoSuchElementException(
            `user pool client ${clientId} details in user pool ${userPoolId} not found`
          )
      )
    );
  }

  private userPools() {
    return Stream.fromAsyncIterable(
      paginateListUserPools(
        {
          client: this.client,
        },
        {
          MaxResults: 50,
        }
      ),
      (e) => new UnknownException(e)
    ).pipe(
      Stream.runFold(
        [] as UserPoolDescriptionType[],
        (allUserPools, { UserPools }) =>
          Match.value(UserPools).pipe(
            Match.when(Match.undefined, () => allUserPools),
            Match.orElse((userPools) => [...allUserPools, ...userPools])
          )
      )
    );
  }

  private userPoolClients(userPoolId: string) {
    return Stream.fromAsyncIterable(
      paginateListUserPoolClients(
        {
          client: this.client,
        },
        {
          UserPoolId: userPoolId,
          MaxResults: 50,
        }
      ),
      (e) => new UnknownException(e)
    ).pipe(
      Stream.runFold(
        [] as UserPoolClientDescription[],
        (allUserPoolClients, { UserPoolClients }) =>
          Match.value(UserPoolClients).pipe(
            Match.when(Match.undefined, () => allUserPoolClients),
            Match.orElse((userPoolClients) => [
              ...allUserPoolClients,
              ...userPoolClients,
            ])
          )
      )
    );
  }
}

export const CognitoClientLive = Layer.succeed(
  CognitoClient,
  new Client(new CognitoIdentityProviderClient())
);

export const CognitoClientSuccessTest = Layer.succeed(CognitoClient, {
  userPool: (_userPoolName: string) =>
    Effect.succeed({
      Id: 'foo',
    }),
  userPoolClient: (_userPoolId: string, _clientName: string) =>
    Effect.succeed({
      ClientId: 'bar',
    }),
  describePoolClient: (_clientId: string, _userPoolId: string) =>
    Effect.succeed({
      ClientSecret: 'baz',
    }),
});

export const CognitoClientUserPoolIdFailureTest = Layer.succeed(CognitoClient, {
  userPool: (_userPoolName: string) => Effect.succeed({}),
  userPoolClient: (_userPoolId: string, _clientName: string) =>
    Effect.succeed({
      ClientId: 'bar',
    }),
  describePoolClient: (_clientId: string, _userPoolId: string) =>
    Effect.succeed({
      ClientSecret: 'baz',
    }),
});

export const CognitoClientClientIdFailureTest = Layer.succeed(CognitoClient, {
  userPool: (_userPoolName: string) =>
    Effect.succeed({
      Id: 'foo',
    }),
  userPoolClient: (_userPoolId: string, _clientName: string) =>
    Effect.succeed({}),
  describePoolClient: (_clientId: string, _userPoolId: string) =>
    Effect.succeed({
      ClientSecret: 'baz',
    }),
});

export const CognitoClientClientSecretFailureTest = Layer.succeed(
  CognitoClient,
  {
    userPool: (_userPoolName: string) =>
      Effect.succeed({
        Id: 'foo',
      }),
    userPoolClient: (_userPoolId: string, _clientName: string) =>
      Effect.succeed({
        ClientId: 'bar',
      }),
    describePoolClient: (_clientId: string, _userPoolId: string) =>
      Effect.succeed({}),
  }
);
