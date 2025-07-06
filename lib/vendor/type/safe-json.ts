import { Effect } from 'effect';

export class SafeJson {
  private parse = (text: string) => Effect.try<unknown>(() => JSON.parse(text));

  static parse = (text: string) => new SafeJson().parse(text);
}
