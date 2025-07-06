import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  type GetCommandOutput,
  PutCommand,
  type PutCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { Context, Effect, Layer } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { Time } from '../../../../vendor/type/time.js';

export class DynamoClient extends Context.Tag('DynamoClient')<
  DynamoClient,
  {
    get(
      tableName: string,
      pk: string
    ): Effect.Effect<GetCommandOutput, UnknownException>;
    put(
      tableName: string,
      item: Record<string, string>
    ): Effect.Effect<PutCommandOutput, UnknownException>;
  }
>() {
  static build = () => DynamoClientLive;
}

export const DynamoClientLive = Layer.sync(DynamoClient, () => {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient());

  return {
    get: (tableName: string, pk: string) =>
      Effect.tryPromise(() =>
        client.send(
          new GetCommand({
            Key: {
              PK: pk,
            },
            TableName: tableName,
          })
        )
      ),
    put: (tableName: string, item: Record<string, string>) =>
      Effect.tryPromise(() =>
        client.send(new PutCommand({ TableName: tableName, Item: item }))
      ),
  };
});

export const DynamoClientSuccessTest = Layer.succeed(DynamoClient, {
  get: (_tableName: string, _pk: string) =>
    Effect.succeed({
      $metadata: {},
      Item: {
        CreatedAt: Time.now().toISOString(),
        Description: 'foo',
        Id: 'bar',
        Name: 'baz',
        Price: '9.99',
      },
    }),
  put: (_tableName: string, _item: Record<string, string>) =>
    Effect.succeed({
      $metadata: {},
    }),
});

export const DynamoClientFailureTest = Layer.succeed(DynamoClient, {
  get: (_tableName: string, _pk: string) =>
    Effect.succeed({
      $metadata: {},
    }),
  put: (_tableName: string, _item: Record<string, string>) =>
    Effect.succeed({
      $metadata: {},
    }),
});
