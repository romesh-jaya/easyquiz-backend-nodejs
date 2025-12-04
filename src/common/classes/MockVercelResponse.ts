import { ServerResponse } from 'http';
import type { VercelResponse } from '@vercel/node';

export class MockVercelResponse extends ServerResponse {
  statusCode: number = 200;
  private responseBody: any = null;
  private responseHeaders: Record<string, string> = {};

  constructor() {
    super({ autoContentType: false } as any);
  }

  send(body: any): VercelResponse {
    this.responseBody = body;
    return this as any;
  }

  json(jsonBody: any): VercelResponse {
    this.responseBody = jsonBody;
    this.setHeader('Content-Type', 'application/json');
    return this as any;
  }

  status(code: number): VercelResponse {
    this.statusCode = code;
    return this as any;
  }

  redirect(statusOrUrl: string | number, url?: string): VercelResponse {
    if (typeof statusOrUrl === 'number') {
      this.statusCode = statusOrUrl;
      this.setHeader('Location', url || '/');
    } else {
      this.statusCode = 302;
      this.setHeader('Location', statusOrUrl);
    }
    return this as any;
  }

  setHeader(name: string, value: string): this {
    this.responseHeaders[name.toLowerCase()] = value;
    return super.setHeader(name, value);
  }

  getResponseBody(): any {
    return this.responseBody;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  getHeaders(): Record<string, string> {
    return this.responseHeaders;
  }
}
