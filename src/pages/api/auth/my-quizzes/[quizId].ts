import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IPostgresError } from '../../../../common/interfaces/IPostgresError';
import { runCorsMiddleware } from '../../../../common/middleware/cors';
import postgresClient from '../../../../common/postgres';
import { getUserEmailFromAuthToken } from '../../../../common/utils/auth';
import { getQuestionsForQuizInOrder } from '../../../../common/utils/questions';
import { createUpdateQuiz } from '../../../../common/utils/quiz';

const getQuizWithDetails = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const userInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  try {
    const queryText =
      'SELECT * FROM public.quiz WHERE id = $1 AND created_by_user = $2';
    const quizData = await postgresClient.query(queryText, [quizId, email]);
    const quizDataObject = quizData?.rows[0];

    if (quizDataObject) {
      quizDataObject.questions = await getQuestionsForQuizInOrder(
        postgresClient,
        quizId as string,
        quizDataObject.question_order
      );
      return res.status(200).send(quizDataObject);
    }
  } catch (err) {
    const error = err as IPostgresError;
    console.error('Error querying quiz table in DB: ', error.stack);
    return res.status(500).send({
      message: 'Error querying quiz table in DB',
    });
  }
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'PUT') {
    return createUpdateQuiz(req, res);
  }

  if (req.method === 'GET') {
    return getQuizWithDetails(req, res);
  }

  res.setHeader('Allow', ['PUT', 'GET']);
  return res.status(405).end('Method Not Allowed');
}
