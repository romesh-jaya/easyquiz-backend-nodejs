import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../../../common/middleware/cors';
import { createUpdateDeleteQuestion } from '../../../../../../common/utils/question';

import { getUserIDFromAuthToken } from '../../../../../../common/utils/auth';
import { QuizQuestion } from '../../../../../../common/types/QuizQuestion';
import controllerPostgres from '../../../../../../common/infrastructure/postgres/controllers/postgres-question-controller';

export let controller = controllerPostgres;

const updateQuizQuestion = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId, questionId } = req.query;
  const { questionContent, answers } = req.body;

  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let quizQuestion: Partial<QuizQuestion> = {
    id: questionId as string,
    quizId: quizId as string,
    questionContent,
    answers,
  };

  let response = await controller.update(
    quizQuestion,
    userInfo.userId as string
  );
  return res.status(200).send(response);
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'PUT') {
    return updateQuizQuestion(req, res);
  }

  if (req.method === 'DELETE') {
    return createUpdateDeleteQuestion(req, res, true);
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end('Method Not Allowed');
}
