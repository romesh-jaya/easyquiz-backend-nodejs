import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../common/firebase';
import { IFirebaseAuthError } from '../../common/interfaces/IFirebaseAuthError';

export interface ISignupError {
  error: string;
  isGeneralError?: boolean;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send('Error: email or password was found to be empty');
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log('Successfully registered!');
    res.status(200).send({ error: '' });
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
}
