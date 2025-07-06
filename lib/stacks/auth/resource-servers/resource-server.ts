import * as cognito from 'aws-cdk-lib/aws-cognito';
import type { Config } from '../../../infrastructure/config/config.js';
import { ReadScope } from './scopes/read-scope.js';
import { WriteScope } from './scopes/write-scope.js';

interface ResourceServerProps {
  readonly config: Config;
  readonly userPool: cognito.IUserPool;
}

export class ResourceServer {
  readonly readScope: cognito.OAuthScope;
  readonly writeScope: cognito.OAuthScope;

  constructor({ config, userPool }: ResourceServerProps) {
    const readScope = new ReadScope();
    const writeScope = new WriteScope();
    const resourceServer = new cognito.UserPoolResourceServer(
      userPool,
      'EcommerceApiResourceServer',
      {
        identifier: config.settings.aws.cognito.resourceServerIdentifier,
        userPool,
        scopes: [readScope, writeScope],
      }
    );

    this.readScope = cognito.OAuthScope.resourceServer(
      resourceServer,
      readScope
    );
    this.writeScope = cognito.OAuthScope.resourceServer(
      resourceServer,
      writeScope
    );
  }
}
