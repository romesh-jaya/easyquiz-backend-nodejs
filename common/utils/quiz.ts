import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IPostgresError } from '../interfaces/IPostgresError';
import postgresClient from '../postgres';
import { v4 as uuidv4 } from 'uuid';
import { getUserEmailFromAuthToken } from '../utils/auth';
import { UserInfo } from '../types/UserInfo';

export const createUpdateQuiz = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  const { quizId } = req.query;
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

  // Note: we return status 200 in some cases as we need to send a JS object
  try {
    const client = await postgresClient.connect();
    try {
      await client.query('BEGIN');
      if (quizId) {
        const queryText =
          'UPDATE public.quiz SET name = $1, description = $2, pass_mark_percentage = $3 where id = $4';
        await client.query(queryText, [
          quizName,
          description,
          passMarkPercentage,
          quizId,
        ]);
        console.log('Quiz updated: ', quizId);
      } else {
        const uuid = uuidv4();
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
        console.log('Quiz saved: ', uuid);
      }
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

  res.status(200).send({ error: '' });
};
