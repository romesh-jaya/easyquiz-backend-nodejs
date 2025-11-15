import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../common/middleware/cors';
import { getUserEmailFromAuthToken } from '../../../../common/utils/auth';
import { Quiz } from '../../../../common/types/Quiz';
import controllerPostgres from '../../../../common/infrastructure/postgres/controllers/postgres-quiz-controller';

export let controller = controllerPostgres;

const getQuizzesForUser = async (req: VercelRequest, res: VercelResponse) => {
  const userInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let response = await controller.getQuizzesForUser(userInfo.email as string);
  return res.status(200).send(response);
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
