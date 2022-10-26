import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../common/firebase';
import { IFirebaseAuthError } from '../../common/interfaces/IFirebaseAuthError';
import { IPostgresError } from '../../common/interfaces/IPostgresError';
import postgresClient from '../../common/postgres';

export interface ISignupError {
  error: string;
  isGeneralError?: boolean;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res
      .status(400)
      .send(
        'Error: email, firstName, lastName or password was found to be empty'
      );
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    const error = err as IFirebaseAuthError;
    console.error('Error while signing up: ', error.message);
    switch (error.code) {
      case 'auth/email-already-in-use':
        return res.status(400).send({
          error: 'Email address is already in use',
          isGeneralError: true,
        });
      default:
        return res.status(400).send({
          error: 'Unknown error occured while trying to signup',
          isGeneralError: false,
        });
    }
  }

  try {
    const client = await postgresClient.connect();
    try {
      await client.query('BEGIN');
      const queryText =
        'INSERT INTO public.quiz_user(email, first_name, last_name) VALUES ($1, $2, $3)';
      await client.query(queryText, [email, firstName, lastName]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    const error = err as IPostgresError;
    console.error('Error while inserting User record to DB: ', error.stack);
  }

  console.log('Successfully registered user: ', email);
  res.status(200).send({ error: '' });
}
