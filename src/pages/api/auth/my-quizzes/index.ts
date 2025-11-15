import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IPostgresError } from '../../../../common/interfaces/Other/IPostgresError';
import { runCorsMiddleware } from '../../../../common/middleware/cors';
import postgresClient from '../../../../common/postgres';
import { getUserEmailFromAuthToken } from '../../../../common/utils/auth';
import { Quiz } from '../../../../common/types/Quiz';
import controllerPostgres from '../../../../common/infrastructure/postgres/controllers/postgres-quiz-controller';

let controller = controllerPostgres;

const getQuizzesForUser = async (req: VercelRequest, res: VercelResponse) => {
  const userInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  try {
    const queryText =
      'SELECT * FROM public.quiz WHERE created_by_user = $1 ORDER BY last_updated DESC';
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

const createQuiz = async (req: VercelRequest, res: VercelResponse) => {
  const { quizName, description, passMarkPercentage } = req.body;

  const userInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let quiz: Partial<Quiz> = {
    name: quizName,
    description,
    passMarkPercentage,
  };

  let response = await controller.create(quiz, userInfo.email as string);
  return res.status(200).send(response);
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return createQuiz(req, res);
  }

  if (req.method === 'GET') {
    return getQuizzesForUser(req, res);
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).end('Method Not Allowed');
}
