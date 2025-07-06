import * as cdk from 'aws-cdk-lib';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';

export class ProductsTable extends dynamo.TableV2 {
  constructor(scope: Construct) {
    super(scope, 'ProductsTable', {
      billing: dynamo.Billing.onDemand(),
      globalSecondaryIndexes: [
        {
          indexName: 'GSI1',
          partitionKey: { name: 'GSI1PK', type: dynamo.AttributeType.STRING },
          sortKey: { name: 'GSI1SK', type: dynamo.AttributeType.STRING },
        },
      ],
      partitionKey: { name: 'PK', type: dynamo.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
