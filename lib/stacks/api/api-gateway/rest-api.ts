import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import type * as cognito from 'aws-cdk-lib/aws-cognito';
import type * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';
import type { Config } from '../../../infrastructure/config/config.js';
import { CognitoAuthorizer } from '../auth/cognito-authorizer.js';
import { ProductsResouces } from '../products/products-resources.js';

interface RestApiProps {
  readonly cognitoUserPools: cognito.IUserPool[];
  readonly config: Config;
  readonly productsTable: dynamo.ITableV2;
}

export class RestApi extends apigw.RestApi {
  constructor(scope: Construct, props: RestApiProps) {
    super(scope, 'RestApi');

    const { cognitoUserPools, config, productsTable } = props;

    const authorizer = new CognitoAuthorizer(this, {
      cognitoUserPools,
    });

    new ProductsResouces(this, {
      api: this,
      authorizer,
      productsTable,
    });

    cdk.Tags.of(this).add('Name', config.settings.api.name);
  }
}
