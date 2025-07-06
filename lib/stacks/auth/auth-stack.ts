import * as cdk from 'aws-cdk-lib';
import type * as cognito from 'aws-cdk-lib/aws-cognito';
import type { Construct } from 'constructs';
import type { Config } from '../../infrastructure/config/config.js';
import { ApiUserPool } from './pools/api-user-pool.js';

interface AuthStackProps extends cdk.StackProps {
  readonly config: Config;
}

export class AuthStack extends cdk.Stack {
  readonly apiUserPool: cognito.IUserPool;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    this.apiUserPool = new ApiUserPool(this, props);
  }
}
