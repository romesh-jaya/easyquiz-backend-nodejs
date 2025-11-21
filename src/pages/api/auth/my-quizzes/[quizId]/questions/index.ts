import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../../../common/middleware/cors';

import controllerPostgres from '../../../../../../common/infrastructure/postgres/controllers/postgres-question-controller';
import { QuizQuestion } from '../../../../../../common/types/QuizQuestion';
import { getUserIDFromAuthToken } from '../../../../../../common/utils/auth';
import { MESSAGE_ERROR } from '../../../../../../common/constants/messages';

export let controller = controllerPostgres;

const createQuizQuestion = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const { questionContent, answers } = req.body;

  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let quizQuestion: Partial<QuizQuestion> = {
    quizId: quizId as string,
    questionContent,
    answers,
  };

  let response = await controller.create(
    quizQuestion,
    userInfo.userId as string
  );
  return res.status(200).send(response);
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      return createQuizQuestion(req, res);
    }
  } catch (error) {
    return res.status(500).send((error as any)?.message || MESSAGE_ERROR);
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).end('Method Not Allowed');
}
