import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IPostgresError } from '../interfaces/IPostgresError';
import postgresClient from '../postgres';
import { v4 as uuidv4 } from 'uuid';
import { getUserEmailFromAuthToken } from './auth';
import { UserInfo } from '../types/UserInfo';

export const createUpdateQuestion = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  const { quizId } = req.query;
  const { questionContent, answers } = req.body;

  if (!questionContent || !answers) {
    return res
      .status(400)
      .send('Error: questionContent or answers was found to be empty');
  }

  const userInfo: UserInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // Note: we return status 200 in some cases as we need to send a JS object
  try {
    const client = await postgresClient.connect();
    try {
      await client.query('BEGIN');

      const uuid = uuidv4();
      const queryText =
        'INSERT INTO public.quiz_question(id, quiz_id, question_content, answers)  VALUES ($1, $2, $3, $4)';
      await client.query(queryText, [uuid, quizId, questionContent, answers]);
      console.log('Question saved: ', uuid);
      await client.query('COMMIT');
    } catch (err) {
      const e = err as IPostgresError;
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    const error = err as IPostgresError;
    console.error('Error while inserting Question record to DB: ', error.stack);
    return res.status(200).send({
      error: 'Unknown error occured while saving Question',
    });
  }

  res.status(200).send({ error: '' });
};
