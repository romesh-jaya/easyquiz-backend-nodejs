import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../common/infrastructure/express/middleware/cors';
import { getUserIDFromAuthToken } from '../../../../common/utils/auth';
import { Quiz } from '../../../../common/types/Request/Quiz';
import controllerPostgres from '../../../../common/infrastructure/postgres/controllers/postgres-quiz-controller';
import { MESSAGE_ERROR } from '../../../../common/constants/messages';

export let controller = controllerPostgres;

const getQuizWithDetails = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let quizWithDetails = await controller.getQuizWithDetails(
    quizId as string,
    userInfo.userId as string
  );
  return res.status(200).send(quizWithDetails);
};

const updateQuiz = async (req: VercelRequest, res: VercelResponse) => {
  const { quizName, description, passMarkPercentage } = req.body;

  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let quiz: Partial<Quiz> = {
    id: req.query.quizId as string,
    name: quizName,
    description,
    passMarkPercentage,
  };

  let response = await controller.update(quiz, userInfo.userId as string);
  return res.status(200).send(response);
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);

  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'PUT') {
      return updateQuiz(req, res);
    }

    if (req.method === 'GET') {
      return getQuizWithDetails(req, res);
    }
  } catch (error) {
    return res.status(500).send((error as any)?.message || MESSAGE_ERROR);
  }

  res.setHeader('Allow', ['PUT', 'GET']);
  return res.status(405).end('Method Not Allowed');
}
