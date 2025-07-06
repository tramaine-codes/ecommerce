import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { test } from 'vitest';
import { ProductsResources } from '../../../../../lib/stacks/dynamo/products/products-resources.js';

const stack = new cdk.Stack(new cdk.App());

new ProductsResources(stack);

const template = Template.fromStack(stack);

test('creates global table', () => {
  template.hasResource('AWS::DynamoDB::GlobalTable', {
    DeletionPolicy: 'Delete',
    Properties: {
      AttributeDefinitions: [
        {
          AttributeName: 'PK',
          AttributeType: 'S',
        },
        {
          AttributeName: 'GSI1PK',
          AttributeType: 'S',
        },
        {
          AttributeName: 'GSI1SK',
          AttributeType: 'S',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            {
              AttributeName: 'GSI1PK',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'GSI1SK',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      KeySchema: [
        {
          AttributeName: 'PK',
          KeyType: 'HASH',
        },
      ],
    },
    UpdateReplacePolicy: 'Delete',
  });
});
