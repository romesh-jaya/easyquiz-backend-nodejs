import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function (_: VercelRequest, res: VercelResponse) {
  res.send(`Server is up`);
}
