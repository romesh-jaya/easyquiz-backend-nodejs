import { VercelRequest } from '@vercel/node';
import { UserInfo } from '../types/UserInfo';
import { auth } from '../firebase';
import postgresClient from '../postgres';

export const getAuthToken = (req: VercelRequest): string | null => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

// Didn't add this as a middleware as it is Postgres dependant
export const getUserIDFromAuthToken = async (
  req: VercelRequest
): Promise<UserInfo> => {
  const authToken = getAuthToken(req);
  if (!authToken) {
    return {
      error:
        'You are not authorized to make this request - Auth token not found',
    };
  }

  try {
    const userInfo = await auth.verifyIdToken(authToken);
    const userEmail = userInfo.email;

    if (!userEmail) {
      return { error: 'Calculating user email from auth token failed' };
    }

    try {
      const queryText = 'SELECT * FROM public.quiz_user WHERE email = $1';
      let data = await postgresClient.query(queryText, [userEmail]);
      if (!data?.rows[0]) {
        return { error: `Error: no userdata was found for user: ${userEmail}` };
      }
      return { userId: data?.rows[0].id };
    } catch (err) {
      return { error: 'Error querying quiz_user table in DB' };
    }
  } catch (e) {
    return { error: 'You are not authorized to make this request' };
  }
};
