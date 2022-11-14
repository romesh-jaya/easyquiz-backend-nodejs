import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgresClient from '../../../common/postgres';
import { getUserEmailFromAuthToken } from '../../../common/utils/auth';
import { UserInfo } from '../../../common/types/UserInfo';

export default async function (req: VercelRequest, res: VercelResponse) {
  let data;
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const userInfo: UserInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  try {
    const queryText = 'SELECT * FROM public.quiz_user WHERE email = $1';
    data = await postgresClient.query(queryText, [email]);
    if (!data?.rows[0]) {
      return res
        .status(400)
        .send(`Error: no userdata was found for user: ${email}`);
    }
  } catch (err) {
    return res.status(500).send({
      message: 'Error querying quiz_user table in DB',
    });
  }

  res.status(200).send(data?.rows[0]);
}
