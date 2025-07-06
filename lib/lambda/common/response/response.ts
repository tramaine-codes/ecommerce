import type { APIGatewayProxyResult } from 'aws-lambda';

interface ResponseDetails {
  readonly body: string;
  readonly statusCode: 200 | 400 | 404 | 500;
}

export class Response {
  constructor(private readonly details: ResponseDetails) {}

  private produce = (): APIGatewayProxyResult => {
    const { body, statusCode } = this.details;

    return {
      body,
      statusCode,
    };
  };

  static ok = (requestId: string, data: Record<string, unknown>) => {
    const details: ResponseDetails = {
      body: JSON.stringify({ requestId, message: 'OK', ...data }),
      statusCode: 200,
    };

    return new Response(details).produce();
  };

  static badRequest = (requestId: string, data: Record<string, unknown>) => {
    const details: ResponseDetails = {
      body: JSON.stringify({ requestId, message: 'Bad Request', ...data }),
      statusCode: 400,
    };

    return new Response(details).produce();
  };

  static notFound = (requestId: string) => {
    const details: ResponseDetails = {
      body: JSON.stringify({ requestId, message: 'Not Found' }),
      statusCode: 404,
    };

    return new Response(details).produce();
  };

  static serverError = (requestId: string) => {
    const details: ResponseDetails = {
      body: JSON.stringify({ requestId, message: 'Internal Server Error' }),
      statusCode: 500,
    };

    return new Response(details).produce();
  };
}
