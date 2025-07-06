import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import type { Construct } from 'constructs';
import type { Config } from '../../../infrastructure/config/config.js';
import { TestPoolClient } from '../clients/test-pool-client.js';
import { ResourceServer } from '../resource-servers/resource-server.js';
import { PoolDomain } from './domains/pool-domain.js';

interface ApiUserPoolProps {
  readonly config: Config;
}

export class ApiUserPool extends cognito.UserPool {
  constructor(scope: Construct, { config }: ApiUserPoolProps) {
    super(scope, 'EcommerceApiPool', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      userPoolName: config.settings.aws.cognito.userPoolName,
    });

    const { readScope, writeScope } = new ResourceServer({
      config,
      userPool: this,
    });

    new PoolDomain({ config, userPool: this });

    new TestPoolClient({
      config,
      scopes: [readScope, writeScope],
      userPool: this,
    });
  }
}
