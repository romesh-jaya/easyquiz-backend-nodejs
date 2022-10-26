import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgresClient from '../../common/postgres';

export default async function (req: VercelRequest, res: VercelResponse) {
  let data;
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).send('Error: email was found to be empty');
  }

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
