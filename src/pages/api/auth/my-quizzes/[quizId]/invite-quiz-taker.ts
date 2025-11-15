import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../../common/middleware/cors';
import { getUserIDFromAuthToken } from '../../../../../common/utils/auth';
import controllerPostgres from '../../../../../common/infrastructure/postgres/controllers/postgres-quiz-controller';

export let controller = controllerPostgres;

const inviteQuizTaker = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const { quizTaker } = req.body;

  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let response = await controller.inviteQuizTaker(
    quizId as string,
    quizTaker,
    userInfo.userId as string
  );
  return res.status(200).send(response);
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return inviteQuizTaker(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end('Method Not Allowed');
}
