import {
  GetObjectCommand,
  type GetObjectCommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
  SelectObjectContentCommand,
  type SelectObjectContentCommandInput,
  type SelectObjectContentCommandOutput,
  type SelectObjectContentEventStream,
} from '@aws-sdk/client-s3';
import { Chunk, Effect, Either, Match, Option, Stream } from 'effect';

export class Client {
  private readonly client = new S3Client();

  get = (params: GetObjectCommandInput) =>
    Effect.tryPromise(() => this.client.send(new GetObjectCommand(params)));

  put = (params: PutObjectCommandInput) =>
    Effect.tryPromise(() => this.client.send(new PutObjectCommand(params)));

  select = (params: SelectObjectContentCommandInput) =>
    Effect.tryPromise(() =>
      this.client.send(new SelectObjectContentCommand(params))
    ).pipe(Effect.andThen((output) => this.selectOutput(output)));

  private selectOutput = ({
    $metadata: { httpStatusCode },
    Payload,
  }: SelectObjectContentCommandOutput) =>
    Match.value(httpStatusCode).pipe(
      Match.when(200, () =>
        Option.fromNullable(Payload).pipe(
          Either.fromOption(() => new Error('payload not found')),
          Effect.andThen((payload) => this.selectOutputPayload(payload))
        )
      ),
      Match.orElse(() =>
        Effect.fail(
          new Error(
            `SelectObjectContentCommand failed with status code of ${httpStatusCode}`
          )
        )
      )
    );

  private selectOutputPayload = (
    payload: AsyncIterable<SelectObjectContentEventStream>
  ) => {
    Effect.tryPromise(async () => {
      const stream = Stream.fromAsyncIterable(
        payload,
        () => new Error('failed processing stream')
      );

      return stream.pipe(
        Stream.runFold(Chunk.empty<Uint8Array>(), (chunks, chunk) =>
          Option.fromNullable(chunk.Records).pipe(
            Option.flatMapNullable(({ Payload }) => Payload),
            Option.match({
              onNone: () => chunks,
              onSome: (chunk) => chunks.pipe(Chunk.append(chunk)),
            })
          )
        ),
        Effect.andThen((chunks) =>
          Buffer.concat(chunks.pipe(Chunk.toReadonlyArray)).toString('utf8')
        )
      );
    });
  };
}
