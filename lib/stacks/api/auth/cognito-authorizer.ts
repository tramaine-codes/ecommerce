import * as apigw from 'aws-cdk-lib/aws-apigateway';
import type { Construct } from 'constructs';

export class CognitoAuthorizer extends apigw.CognitoUserPoolsAuthorizer {
  constructor(
    scope: Construct,
    { cognitoUserPools }: apigw.CognitoUserPoolsAuthorizerProps
  ) {
    super(scope, 'CognitoAuthorizer', {
      cognitoUserPools,
    });
  }
}
