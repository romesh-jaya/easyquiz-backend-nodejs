import Cors from 'cors';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const cors = Cors({
  methods: ['POST', 'PUT', 'GET', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export function runCorsMiddleware(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}
