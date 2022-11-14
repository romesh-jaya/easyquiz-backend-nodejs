import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IPostgresError } from '../../../common/interfaces/IPostgresError';
import postgresClient from '../../../common/postgres';
import { getUserEmailFromAuthToken } from '../../../common/utils/auth';
import { UserInfo } from '../../../common/types/UserInfo';
import { createUpdateQuiz } from '../../../common/utils/quiz';

export interface ISignupError {
  error: string;
  isGeneralError?: boolean;
}

const getQuizzesForUser = async (req: VercelRequest, res: VercelResponse) => {
  const userInfo: UserInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  try {
    const queryText = 'SELECT * FROM public.quiz WHERE created_by_user = $1';
    const data = await postgresClient.query(queryText, [email]);
    return res.status(200).send(data?.rows);
  } catch (err) {
    const error = err as IPostgresError;
    console.error('Error querying quiz table in DB: ', error.stack);
    return res.status(500).send({
      message: 'Error querying quiz table in DB',
    });
  }
};

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return createUpdateQuiz(req, res);
  }

  if (req.method === 'GET') {
    return getQuizzesForUser(req, res);
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).end('Method Not Allowed');
}
