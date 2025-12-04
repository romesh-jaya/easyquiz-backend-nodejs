import { IncomingMessage } from 'http';
import type { VercelRequest } from '@vercel/node';

export class MockVercelRequest extends IncomingMessage {
  query: Record<string, string | string[]> = {};
  cookies: Record<string, string> = {};
  body: any = null;

  constructor(options?: {
    method?: string;
    url?: string;
    query?: Record<string, string | string[]>;
    cookies?: Record<string, string>;
    body?: any;
    headers?: Record<string, string>;
  }) {
    super({ readable: false } as any);
    
    if (options) {
      this.method = options.method || 'GET';
      this.url = options.url || '/';
      this.query = options.query || {};
      this.cookies = options.cookies || {};
      this.body = options.body || null;
      
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value;
        });
      }
    } else {
      this.method = 'GET';
      this.url = '/';
    }
  }

  setQuery(query: Record<string, string | string[]>): this {
    this.query = query;
    return this;
  }

  setCookies(cookies: Record<string, string>): this {
    this.cookies = cookies;
    return this;
  }

  setBody(body: any): this {
    this.body = body;
    return this;
  }

  setHeader(name: string, value: string): this {
    this.headers[name.toLowerCase()] = value;
    return this;
  }
}
