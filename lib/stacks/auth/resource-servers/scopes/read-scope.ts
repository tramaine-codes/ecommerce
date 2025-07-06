import * as cognito from 'aws-cdk-lib/aws-cognito';

export class ReadScope extends cognito.ResourceServerScope {
  constructor() {
    super({
      scopeName: 'ecommerceapi.read',
      scopeDescription: 'Ecommerce API read scope',
    });
  }
}
