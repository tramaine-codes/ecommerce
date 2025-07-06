import * as cognito from 'aws-cdk-lib/aws-cognito';
import type { Config } from '../../../../infrastructure/config/config.js';

interface PoolDomainProps {
  readonly config: Config;
  readonly userPool: cognito.IUserPool;
}

export class PoolDomain extends cognito.UserPoolDomain {
  constructor({ config, userPool }: PoolDomainProps) {
    super(userPool, 'EcommerceApiDomain', {
      cognitoDomain: {
        domainPrefix: config.settings.aws.cognito.domainPrefix,
      },
      userPool,
    });
  }
}
