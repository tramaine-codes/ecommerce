import * as apigw from 'aws-cdk-lib/aws-apigateway';
import type * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Package } from '../../../vendor/pkg/package.js';

interface ProductsResourcesProps {
  readonly api: apigw.RestApi;
  readonly authorizer: apigw.IAuthorizer;
  readonly productsTable: dynamo.TableV2;
}

export class ProductsResouces extends Construct {
  constructor(
    scope: Construct,
    { api, authorizer, productsTable }: ProductsResourcesProps
  ) {
    super(scope, 'ProductsResources');

    const handler = new nodejs.NodejsFunction(this, 'ApiHandler', {
      entry: `${Package.rootDir()}/lib/lambda/products/api/lambda.ts`,
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_24_X,
    });
    const integration = new apigw.LambdaIntegration(handler);

    const products = api.root.addResource('products');
    products.addMethod('POST', integration, {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
      authorizationScopes: ['EcommerceApiResourceService/ecommerceapi.write'],
    });

    const product = products.addResource('{productId}');
    product.addMethod('GET', integration, {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
      authorizationScopes: ['EcommerceApiResourceService/ecommerceapi.read'],
    });

    productsTable.grantReadWriteData(handler);
  }
}
