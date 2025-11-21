import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../../../common/middleware/cors';

import { getUserIDFromAuthToken } from '../../../../../../common/utils/auth';
import { QuizQuestion } from '../../../../../../common/types/QuizQuestion';
import controllerPostgres from '../../../../../../common/infrastructure/postgres/controllers/postgres-question-controller';
import { MESSAGE_ERROR } from '../../../../../../common/constants/messages';

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

const deleteQuizQuestion = async (req: VercelRequest, res: VercelResponse) => {
  const { questionId } = req.query;

  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let response = await controller.delete(
    questionId as string,
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

    if (req.method === 'PUT') {
      return updateQuizQuestion(req, res);
    }

    if (req.method === 'DELETE') {
      return deleteQuizQuestion(req, res);
    }
  } catch (error) {
    return res.status(500).send((error as any)?.message || MESSAGE_ERROR);
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end('Method Not Allowed');
}
