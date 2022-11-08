import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IPostgresError } from '../../../common/interfaces/IPostgresError';
import postgresClient from '../../../common/postgres';
import { v4 as uuidv4 } from 'uuid';
import { getUserEmailFromAuthToken } from '../../../common/utils/auth';
import { UserInfo } from '../../../types/UserInfo';

export interface ISignupError {
  error: string;
  isGeneralError?: boolean;
}

const createUpdateQuiz = async (req: VercelRequest, res: VercelResponse) => {
  const { quizName, description, passMarkPercentage } = req.body;

  if (!quizName || !description || !passMarkPercentage) {
    return res
      .status(400)
      .send(
        'Error: quizName, description or passMarkPercentage was found to be empty'
      );
  }

  const userInfo: UserInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';
  const uuid = uuidv4();

  // Note: we return status 200 in some cases as we need to send a JS object
  try {
    const client = await postgresClient.connect();
    try {
      await client.query('BEGIN');
      const queryText =
        'INSERT INTO public.quiz(id, created_by_user, name, description, pass_mark_percentage, can_retake_quiz)  VALUES ($1, $2, $3, $4, $5, $6)';
      await client.query(queryText, [
        uuid,
        email,
        quizName,
        description,
        passMarkPercentage,
        true,
      ]);
      await client.query('COMMIT');
    } catch (err) {
      const e = err as IPostgresError;
      if (e.code && e.code === '23505') {
        await client.query('ROLLBACK');
        return res.status(200).send({
          error: 'Another Quiz already exists with the same name',
          isGeneralError: true,
        });
      }
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    const error = err as IPostgresError;
    console.error('Error while inserting Quiz record to DB: ', error.stack);
    return res.status(200).send({
      error: 'Unknown error occured while saving Quiz',
      isGeneralError: false,
    });
  }

  console.log('Quiz saved: ', uuid);
  res.status(200).send({ error: '' });
};

const getQuizzesForUser = async (req: VercelRequest, res: VercelResponse) => {
  const userInfo: UserInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  try {
    const queryText = 'SELECT * FROM public.quiz WHERE created_by_user = $1';
    const data = await postgresClient.query(queryText, [email]);
    return res.status(200).send(data?.rows);
  } catch (err) {
    const error = err as IPostgresError;
    console.error('Error querying quiz table in DB: ', error.stack);
    return res.status(500).send({
      message: 'Error querying quiz table in DB',
    });
  }
};

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return createUpdateQuiz(req, res);
  }

  if (req.method === 'GET') {
    return getQuizzesForUser(req, res);
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
