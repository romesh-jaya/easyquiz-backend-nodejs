import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createUpdateDeleteQuestion } from '../../../../../common/utils/question';

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'PUT') {
    return createUpdateDeleteQuestion(req, res);
  }

  if (req.method === 'DELETE') {
    return createUpdateDeleteQuestion(req, res, true);
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end('Method Not Allowed');
}
