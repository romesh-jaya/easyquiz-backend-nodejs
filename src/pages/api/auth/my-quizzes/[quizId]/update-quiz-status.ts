import type { VercelRequest, VercelResponse } from '@vercel/node';
import { QuizStatus } from '../../../../../common/enums/QuizStatus';
import { IPostgresError } from '../../../../../common/interfaces/IPostgresError';
import { runCorsMiddleware } from '../../../../../common/middleware/cors';
import postgresClient from '../../../../../common/postgres';
import { getUserEmailFromAuthToken } from '../../../../../common/utils/auth';

const updateQuizStatus = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const { status } = req.body;
  const statusValues = Object.values(QuizStatus);

  if (!status) {
    return res.status(400).send('Error: status was found to be empty');
  }

  if (!statusValues.includes(status as unknown as QuizStatus)) {
    return res
      .status(400)
      .send(`Error: status was not one of the values: ${statusValues}`);
  }

  const userInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  // Note: we return status 200 in some cases as we need to send a JS object
  try {
    const client = await postgresClient.connect();

    const queryText =
      'SELECT * FROM public.quiz WHERE id = $1 AND created_by_user = $2';
    const quizData = await client.query(queryText, [quizId, email]);
    const quizDataObject = quizData?.rows[0];

    if (
      (quizDataObject.status === QuizStatus.Unpublished &&
        status === QuizStatus.Published) ||
      (quizDataObject.status === QuizStatus.Published &&
        status === QuizStatus.Unpublished) ||
      status === QuizStatus.Archived
    ) {
      try {
        await client.query('BEGIN');
        const queryText = 'UPDATE public.quiz SET status = $1 WHERE id = $2';
        await client.query(queryText, [status, quizId]);
        console.log('Quiz status updated for: ', quizId);
        await client.query('COMMIT');
        res.status(200).send({ error: '' });
      } catch (err) {
        const e = err as IPostgresError;
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.end();
      }
    } else {
      return res
        .status(200)
        .send({ error: 'Error: status to transfer to is invalid' });
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
    return updateQuizStatus(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end('Method Not Allowed');
}
