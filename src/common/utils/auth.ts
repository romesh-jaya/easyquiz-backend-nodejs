import { VercelRequest } from '@vercel/node';
import { UserInfo } from '../types/UserInfo';
import { auth } from '../firebase';

export const getAuthToken = (req: VercelRequest): string | null => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export const getUserEmailFromAuthToken = async (
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
    return { email: userEmail };
  } catch (e) {
    return { error: 'You are not authorized to make this request' };
  }
};
