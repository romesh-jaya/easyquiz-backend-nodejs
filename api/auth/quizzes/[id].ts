import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createUpdateQuiz } from '../../../common/utils/quiz';

export default async function (req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'PUT') {
    return createUpdateQuiz(req, res, id + '');
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).end('Method Not Allowed');
}
