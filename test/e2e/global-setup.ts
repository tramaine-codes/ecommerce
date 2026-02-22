import { Effect } from 'effect';
import type { TestProject } from 'vitest/node';
import { ApiGateway } from '../../lib/infrastructure/api-gateway/api-gateway.js';
import { CognitoGateway } from '../../lib/infrastructure/cognito/cognito-gateway.js';
import { Config } from '../../lib/infrastructure/config/config.js';
import { OAuthGateway } from '../../lib/infrastructure/oauth/oauth-gateway.js';

export default async function setup(project: TestProject) {
  const {
    settings: {
      api: { name: apiName },
      aws: {
        apiGateway: { region },
        cognito: { issuerHostname, testUserPoolClientName, userPoolName },
      },
    },
  } = new Config();
  const program = Effect.gen(function* () {
    const cognitoGateway = yield* CognitoGateway;
    const oauthGateway = yield* OAuthGateway;
    const apiGateway = yield* ApiGateway;

    const { clientId, clientSecret, userPoolId } =
      yield* cognitoGateway.credentials(userPoolName, testUserPoolClientName);
    const accessToken = yield* oauthGateway.accessToken(
      `https://${issuerHostname}/${userPoolId}`,
      clientId,
      clientSecret
    );
    const apiId = yield* apiGateway.apiId(apiName);

    project.provide('accessToken', accessToken);
    project.provide(
      'apiBaseUrl',
      `https://${apiId}.execute-api.${region}.amazonaws.com/prod`
    );
  });

  await program.pipe(
    Effect.provide(OAuthGateway.build()),
    Effect.provide(CognitoGateway.build()),
    Effect.provide(ApiGateway.build()),
    Effect.runPromise
  );
}

declare module 'vitest' {
  export interface ProvidedContext {
    accessToken: string;
    apiBaseUrl: string;
  }
}
