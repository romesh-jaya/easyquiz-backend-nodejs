import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IPostgresError } from '../../../../../common/interfaces/Other/IPostgresError';
import { runCorsMiddleware } from '../../../../../common/middleware/cors';
import postgresClient from '../../../../../common/postgres';
import { getUserIDFromAuthToken } from '../../../../../common/utils/auth';

const updateQuestionOrder = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const { questionOrder } = req.body;

  if (!questionOrder) {
    return res.status(400).send('Error: questionOrder was found to be empty');
  }

  if (!Array.isArray(questionOrder)) {
    return res.status(400).send('Error: questionOrder must be an array');
  }

  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  // Note: we return status 200 in some cases as we need to send a JS object
  try {
    const client = await postgresClient.connect();
    try {
      await client.query('BEGIN');
      const queryText =
        'UPDATE public.quiz SET question_order = $1 WHERE id = $2 AND created_by_user = $3';
      await client.query(queryText, [questionOrder, quizId, email]);
      console.log('Question order updated for: ', quizId);
      await client.query('COMMIT');
      res.status(200).send({ error: '' });
    } catch (err) {
      const e = err as IPostgresError;
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.end();
    }
  } catch (err) {
    const error = err as IPostgresError;
    console.error('Error while saving Quiz record to DB: ', error.stack);
    return res.status(200).send({
      error: 'Unknown error occured while saving Quiz',
      isGeneralError: false,
    });
  }
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return updateQuestionOrder(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end('Method Not Allowed');
}
