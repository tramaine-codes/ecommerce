import { Context, Effect, HashMap, Inspectable, Layer, Logger } from 'effect';
import { IdGenerator } from '../../../../vendor/id/id-generator.js';

export class AppLogger extends Context.Tag('AppLogger')<
  AppLogger,
  {
    error: (error: unknown) => Effect.Effect<void>;
    info: (message: string) => Effect.Effect<void>;
  }
>() {
  static build = () =>
    AppLoggerLive.pipe(
      Layer.provide(Logger.replace(Logger.defaultLogger, jsonLogger()))
    );
}

const AppLoggerLive = Layer.succeed(AppLogger, {
  error: (error: unknown) => Effect.logError(error),
  info: (message: string) => Effect.log(message),
});

const jsonLogger = () =>
  Logger.make(
    ({ date, logLevel: { label: _logLevel }, message: msg, annotations }) => {
      globalThis.console.log(
        Inspectable.stringifyCircular({
          ...Object.fromEntries(HashMap.toEntries(annotations)),
          _logLevel,
          id: IdGenerator.generate(),
          msg,
          timestamp: date.toISOString(),
        })
      );
    }
  );

export const AppLoggerTest = Layer.succeed(AppLogger, {
  error: (_error: unknown) => Effect.void,
  info: (_message: string) => Effect.void,
});
