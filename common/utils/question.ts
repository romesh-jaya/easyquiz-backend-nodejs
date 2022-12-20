import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IPostgresError } from '../interfaces/IPostgresError';
import postgresClient from '../postgres';
import { v4 as uuidv4 } from 'uuid';
import { getUserEmailFromAuthToken } from './auth';
import { CRUDActionType } from '../enums/CRUDActionType';
import { updateQuestionOrder } from './quiz';

const checkUserAccess = async (
  actionType: number,
  quizId: string,
  questionId: string,
  email: string
): Promise<boolean> => {
  if (actionType !== CRUDActionType.Insert) {
    // Check for user access to the question
    const queryText =
      'SELECT 1 FROM public.quiz_question question, public.quiz quiz WHERE question.quiz_id = quiz.id AND question.id = $1 AND quiz.created_by_user = $2';
    const quizData = await postgresClient.query(queryText, [questionId, email]);
    const quizDataObject = quizData?.rows[0];
    return !!quizDataObject;
  } else {
    // Check for user access to the quiz
    const queryText =
      'SELECT * FROM public.quiz WHERE id = $1 AND created_by_user = $2';
    const quizData = await postgresClient.query(queryText, [quizId, email]);
    const quizDataObject = quizData?.rows[0];
    return !!quizDataObject;
  }
};

export const createUpdateDeleteQuestion = async (
  req: VercelRequest,
  res: VercelResponse,
  isDelete: boolean = false
) => {
  const { quizId, questionId } = req.query;
  let questionContent, answers;
  const actionType = isDelete
    ? CRUDActionType.Delete
    : questionId
    ? CRUDActionType.Update
    : CRUDActionType.Insert;

  if (req.body) {
    questionContent = req.body.questionContent;
    answers = req.body.answers;
  }

  if (actionType !== CRUDActionType.Delete && (!questionContent || !answers)) {
    return res
      .status(400)
      .send('Error: questionContent or answers was found to be empty');
  }

  const userInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  // Note: we return status 200 in some cases as we need to send a JS object
  try {
    if (
      !checkUserAccess(
        actionType,
        quizId as string,
        questionId as string,
        email
      )
    ) {
      return res.status(200).send({
        error: 'You do not have access to this particular question',
      });
    }

    const client = await postgresClient.connect();
    try {
      await client.query('BEGIN');
      if (actionType === CRUDActionType.Delete) {
        const queryText = 'DELETE FROM public.quiz_question WHERE id = $1';
        await client.query(queryText, [questionId]);
        console.log('Question deleted: ', questionId);

        // Update question order
        await updateQuestionOrder(
          client,
          quizId as string,
          questionId as string,
          false
        );
      } else if (actionType === CRUDActionType.Update) {
        const queryText =
          'UPDATE public.quiz_question SET question_content = $1, answers = $2 where id = $3';
        await client.query(queryText, [questionContent, answers, questionId]);
        console.log('Question updated: ', questionId);
      } else {
        const uuid = uuidv4();
        const queryText =
          'INSERT INTO public.quiz_question(id, quiz_id, question_content, answers)  VALUES ($1, $2, $3, $4)';
        await client.query(queryText, [uuid, quizId, questionContent, answers]);
        console.log('Question saved: ', uuid);

        // Update question order
        await updateQuestionOrder(client, quizId as string, uuid);
      }

      await client.query('COMMIT');
    } catch (err) {
      const e = err as IPostgresError;
      if (e.code && e.code === 'ZZ999') {
        await client.query('ROLLBACK');
        return res.status(200).send({
          error: e.message,
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
    console.error('Error while saving Question record to DB: ', error.stack);
    return res.status(200).send({
      error: 'Unknown error occured while saving Question',
    });
  }

  res.status(200).send({ error: '' });
};
