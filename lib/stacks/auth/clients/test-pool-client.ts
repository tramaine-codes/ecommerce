import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import type { Config } from '../../../infrastructure/config/config.js';

interface TestPoolClientProps {
  readonly config: Config;
  readonly scopes: cognito.OAuthScope[];
  readonly userPool: cognito.IUserPool;
}

export class TestPoolClient extends cognito.UserPoolClient {
  constructor({ config, userPool, scopes }: TestPoolClientProps) {
    super(userPool, 'TestPoolClient', {
      accessTokenValidity: cdk.Duration.hours(1),
      enableTokenRevocation: true,
      generateSecret: true,
      oAuth: {
        flows: {
          clientCredentials: true,
        },
        scopes,
      },
      refreshTokenValidity: cdk.Duration.days(1),
      userPool,
      userPoolClientName: config.settings.aws.cognito.testUserPoolClientName,
    });
  }
}
