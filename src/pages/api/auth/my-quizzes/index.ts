import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../common/middleware/cors';
import { getUserIDFromAuthToken } from '../../../../common/utils/auth';
import { Quiz } from '../../../../common/types/Quiz';
import controllerPostgres from '../../../../common/infrastructure/postgres/controllers/postgres-quiz-controller';
import { MESSAGE_ERROR } from '../../../../common/constants/messages';

export let controller = controllerPostgres;

const getQuizzesForUser = async (req: VercelRequest, res: VercelResponse) => {
  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let response = await controller.getQuizzesForUser(userInfo.userId as string);
  return res.status(200).send(response);
};

const createQuiz = async (req: VercelRequest, res: VercelResponse) => {
  const { quizName, description, passMarkPercentage } = req.body;

  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let quiz: Partial<Quiz> = {
    name: quizName,
    description,
    passMarkPercentage,
  };

  let response = await controller.create(quiz, userInfo.userId as string);
  return res.status(200).send(response);
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      return await createQuiz(req, res);
    }

    if (req.method === 'GET') {
      return await getQuizzesForUser(req, res);
    }
  } catch (error) {
    return res.status(500).send((error as any)?.message || MESSAGE_ERROR);
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).end('Method Not Allowed');
}
