import * as cdk from 'aws-cdk-lib';
import type * as cognito from 'aws-cdk-lib/aws-cognito';
import type * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';
import type { Config } from '../../infrastructure/config/config.js';
import { RestApi } from './api-gateway/rest-api.js';

interface ApiStackProps extends cdk.StackProps {
  readonly cognitoUserPools: cognito.IUserPool[];
  readonly config: Config;
  readonly productsTable: dynamo.ITableV2;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { cognitoUserPools, config, productsTable } = props;

    new RestApi(this, {
      cognitoUserPools,
      config,
      productsTable,
    });
  }
}
