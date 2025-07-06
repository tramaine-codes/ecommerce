import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { expect, test } from 'vitest';
import { DynamoStack } from '../../../../lib/stacks/dynamo/dynamo-stack.js';

const app = new cdk.App();
const stack = new DynamoStack(app, 'DynamoStack');

const template = Template.fromStack(stack);

test('matches the snapshot', () => {
  expect(template.toJSON()).toMatchSnapshot();
});
