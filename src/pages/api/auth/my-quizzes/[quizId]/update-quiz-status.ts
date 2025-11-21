import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../../common/middleware/cors';
import { getUserIDFromAuthToken } from '../../../../../common/utils/auth';
import controllerPostgres from '../../../../../common/infrastructure/postgres/controllers/postgres-quiz-controller';
import { MESSAGE_ERROR } from '../../../../../common/constants/messages';

export let controller = controllerPostgres;

const updateQuizStatus = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const { status } = req.body;

  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let response = await controller.updateQuizStatus(
    quizId as string,
    status,
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
      return updateQuizStatus(req, res);
    }
  } catch (error) {
    return res.status(500).send((error as any)?.message || MESSAGE_ERROR);
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end('Method Not Allowed');
}
