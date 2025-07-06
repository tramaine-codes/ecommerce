#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { Config } from '../lib/infrastructure/config/config.js';
import { ApiStack } from '../lib/stacks/api/api-stack.js';
import { AuthStack } from '../lib/stacks/auth/auth-stack.js';
import { DynamoStack } from '../lib/stacks/dynamo/dynamo-stack.js';

const app = new cdk.App();
const config = new Config();
const {
  settings: {
    aws: {
      cdk: { account, region },
    },
  },
} = config;
const env = {
  account,
  region,
} satisfies cdk.Environment;

const { productsTable } = new DynamoStack(app, 'EcommerceDynamoStack', {
  env,
});

const { apiUserPool } = new AuthStack(app, 'EcommerceAuthStack', {
  config,
  env,
});

new ApiStack(app, 'EcommerceApiStack', {
  cognitoUserPools: [apiUserPool],
  config,
  env,
  productsTable,
});
