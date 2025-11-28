import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runCorsMiddleware } from '../../../../common/infrastructure/express/middleware/cors';
import { getUserIDFromAuthToken } from '../../../../common/utils/auth';
import controllerPostgres from '../../../../common/infrastructure/postgres/controllers/postgres-user-controller';
import { MESSAGE_ERROR } from '../../../../common/constants/messages';

export let controller = controllerPostgres;

const getUser = async (req: VercelRequest, res: VercelResponse) => {
  const userInfo = await getUserIDFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  const userId = userInfo.userId ?? '';

  let response = await controller.get(userId);
  if (!response) {
    return res
      .status(400)
      .send(`Error: no userdata was found for user: ${userId}`);
  }

  return res.status(200).send(response);
};

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);

  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      return await getUser(req, res);
    }
  } catch (error) {
    return res.status(500).send((error as any)?.message || MESSAGE_ERROR);
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end('Method Not Allowed');
}
