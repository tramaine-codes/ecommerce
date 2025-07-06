import * as cognito from 'aws-cdk-lib/aws-cognito';

export class WriteScope extends cognito.ResourceServerScope {
  constructor() {
    super({
      scopeName: 'ecommerceapi.write',
      scopeDescription: 'Ecommerce API write scope',
    });
  }
}
