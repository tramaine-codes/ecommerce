import * as cdk from 'aws-cdk-lib';
import type * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';
import { ProductsResources } from './products/products-resources.js';

export class DynamoStack extends cdk.Stack {
  readonly productsTable: dynamodb.ITableV2;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { productsTable } = new ProductsResources(this);

    this.productsTable = productsTable;
  }
}
