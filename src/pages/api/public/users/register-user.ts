import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from '../../../../common/firebase';
import { IFirebaseAuthError } from '../../../../common/interfaces/Other/IFirebaseAuthError';
import { IPostgresError } from '../../../../common/interfaces/Other/IPostgresError';
import { runCorsMiddleware } from '../../../../common/middleware/cors';
import postgresClient from '../../../../common/postgres';
import { v4 as uuidv4 } from 'uuid';

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);

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

  // Note: we return status 200 in some cases as we need to send a JS object
  try {
    const queryText = 'SELECT * FROM public.quiz_user WHERE email = $1';
    let data = await postgresClient.query(queryText, [email]);
    if (data?.rows[0]) {
      return res.status(200).send({
        error: 'Email address is already in use',
        isGeneralError: true,
      });
    }
  } catch (err) {
    console.error('Error while signing up: ', (err as any)?.message);
    return res.status(200).send({
      error: 'Unknown error occured while trying to signup',
      isGeneralError: false,
    });
  }

  try {
    await createOrUpdateUserInAuth(email, password);
  } catch (err) {
    const error = err as IFirebaseAuthError;
    console.error('Error while signing up: ', error.message);
    return res.status(200).send({
      error: 'Unknown error occured while trying to signup',
      isGeneralError: false,
    });
  }

  try {
    const client = await postgresClient.connect();
    try {
      await client.query('BEGIN');
      const uuid = uuidv4();
      const queryText =
        'INSERT INTO public.quiz_user(id, email, first_name, last_name) VALUES ($1, $2, $3, $4)';
      await client.query(queryText, [uuid, email, firstName, lastName]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.end();
    }
  } catch (err) {
    const error = err as IPostgresError;
    console.error('Error while inserting User record to DB: ', error.stack);
    return res.status(200).send({
      error: 'Unknown error occured while trying to signup',
      isGeneralError: false,
    });
  }

  console.log('Successfully registered user: ', email);
  res.status(200).send({ error: '' });
}

async function createOrUpdateUserInAuth(email: string, password: string) {
  try {
    // Attempt to get user by email
    const existingUser = await auth.getUserByEmail(email);
    console.log('User with this email already exists:', existingUser.uid);
    // You can choose to update the existing user here if needed
    // await admin.auth().updateUser(existingUser.uid, { displayName: displayName });
    return existingUser;
  } catch (err) {
    const error = err as IFirebaseAuthError;
    if (error.code === 'auth/user-not-found') {
      // User does not exist, proceed to create
      return await auth.createUser({ email, password });
    } else {
      console.error('Error checking for user existence:', error);
      throw error;
    }
  }
}
