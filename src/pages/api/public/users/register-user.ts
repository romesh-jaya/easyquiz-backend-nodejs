import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from '../../../../common/firebase';
import { IFirebaseAuthError } from '../../../../common/interfaces/Other/IFirebaseAuthError';
import { runCorsMiddleware } from '../../../../common/middleware/cors';
import controllerPostgres from '../../../../common/infrastructure/postgres/controllers/postgres-user-controller';
import { MESSAGE_ERROR } from '../../../../common/constants/messages';
import { v4 as uuidv4 } from 'uuid';

export let controller = controllerPostgres;

const registerUser = async (req: VercelRequest, res: VercelResponse) => {
  const { email, password, firstName, lastName } = req.body;

  if (!password) {
    return res.status(400).send('Error: password was found to be empty');
  }

  const userId = uuidv4();
  let response = await controller.create({
    userId,
    email,
    firstName,
    lastName,
  });

  if (response.error) {
    return res.status(200).send(response);
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

  console.log('Successfully registered user: ', email);
  return res.status(200).send({ error: '' });
};

async function createOrUpdateUserInAuth(email: string, password: string) {
  try {
    // Attempt to get user by email
    const existingUser = await auth.getUserByEmail(email);
    console.log('User with this email already exists:', existingUser.uid);
    // Since we dont know the old pwd, delete the old user and create a new one
    await auth.deleteUser(existingUser.uid);
    await auth.createUser({ email, password });
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

export default async function (req: VercelRequest, res: VercelResponse) {
  await runCorsMiddleware(req, res);

  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      return await registerUser(req, res);
    }
  } catch (error) {
    return res.status(500).send((error as any)?.message || MESSAGE_ERROR);
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
