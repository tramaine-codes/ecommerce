import type * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ProductsTable } from './products-table.js';

export class ProductsResources extends Construct {
  readonly productsTable: dynamodb.ITableV2;

  constructor(scope: Construct) {
    super(scope, 'ProductsResources');

    this.productsTable = new ProductsTable(this);
  }
}
