import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../common/infrastructure/express/middleware/cors';
import { getUserIDFromAuthToken } from '../../../../common/utils/auth';

import controllerPostgres from '../../../../common/infrastructure/postgres/controllers/postgres-quiz-controller';

export let controller = controllerPostgres;

const getOthersQuizzesWithoutCorrectAnswersForUser = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  let response = await controller.getOthersQuizzesWithoutCorrectAnswersForUser(
    userInfo.userId as string
  );
  return res.status(200).send(response);
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return getOthersQuizzesWithoutCorrectAnswersForUser(req, res);
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end('Method Not Allowed');
}
