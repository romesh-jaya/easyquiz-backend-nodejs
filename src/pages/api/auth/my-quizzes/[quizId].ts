import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../common/middleware/cors';
import { getUserEmailFromAuthToken } from '../../../../common/utils/auth';
import { createUpdateQuiz } from '../../../../common/utils/quiz';
import controllerPostgres from '../../../../common/infrastructure/postgres/controllers/postgres-quiz-controller';

let controller = controllerPostgres;

const getQuizWithDetails = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const userInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let quizWithDetails = await controller.getQuizWithDetails(
    quizId as string,
    userInfo.email as string
  );
  return res.status(200).send(quizWithDetails);
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
