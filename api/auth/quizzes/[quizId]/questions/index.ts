import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createUpdateQuestion } from '../../../../../common/utils/question';

export interface ISignupError {
  error: string;
  isGeneralError?: boolean;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return createUpdateQuestion(req, res);
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).end('Method Not Allowed');
}
