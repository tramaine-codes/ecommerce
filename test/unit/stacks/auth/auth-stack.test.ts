import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { expect, test } from 'vitest';
import { Config } from '../../../../lib/infrastructure/config/config.js';
import { AuthStack } from '../../../../lib/stacks/auth/auth-stack.js';

const app = new cdk.App();
const config = new Config();
const stack = new AuthStack(app, 'AuthStack', {
  config,
});

const template = Template.fromStack(stack);

test('matches the snapshot', () => {
  expect(template.toJSON()).toMatchSnapshot();
});
