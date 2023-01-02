import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IAnswer } from '../../../../common/interfaces/IAnswer';
import { IPostgresError } from '../../../../common/interfaces/IPostgresError';
import postgresClient from '../../../../common/postgres';
import { getUserEmailFromAuthToken } from '../../../../common/utils/auth';
import { getQuestionsForQuizInOrder } from '../../../../common/utils/questions';

interface IQuestionWithoutCorrectAnswers {
  questionContent: string;
  answers: string[];
  id: string;
  revision: number;
}

const inviteQuizTaker = async (req: VercelRequest, res: VercelResponse) => {
  const { quizId } = req.query;
  const { quizTaker } = req.body;

  if (!quizTaker) {
    return res.status(400).send('Error: quizTaker was found to be empty');
  }

  const userInfo = await getUserEmailFromAuthToken(req);
  if (userInfo.error) {
    return res.status(400).send(userInfo.error);
  }

  // At this point, we definitely know the user's email
  const email = userInfo.email ?? '';

  // Note: we return status 200 in some cases as we need to send a JS object
  try {
    const client = await postgresClient.connect();

    const queryText =
      'SELECT * FROM public.quiz WHERE id = $1 AND created_by_user = $2';
    const quizData = await client.query(queryText, [quizId, email]);
    const quizDataObject = quizData?.rows[0];

    try {
      if (quizDataObject) {
        const correctAnswerIndexes: number[] = [];
        const questionsWithoutCorrectAnswers: IQuestionWithoutCorrectAnswers[] =
          [];
        const questionsWithAnswers = await getQuestionsForQuizInOrder(
          postgresClient,
          quizId as string,
          quizDataObject.question_order
        );

        questionsWithAnswers.forEach((questionWithAnswer) => {
          const answers = JSON.parse(questionWithAnswer.answers);
          questionsWithoutCorrectAnswers.push({
            id: questionWithAnswer.id,
            answers: answers.map((answer: IAnswer) => answer.answer),
            questionContent: questionWithAnswer.questionContent,
            revision: questionWithAnswer.revision,
          });
          correctAnswerIndexes.push(
            answers.map((answer: IAnswer) => answer.isCorrect)
          );
        });

        await client.query('BEGIN');
        const queryText =
          'INSERT INTO public.quiz_attempt(quiz_id, quiz_revision, quiz_taker, questions, answers, no_of_questions, pass_percentage) VALUES($1, $2, $3, $4, $5, $6, $7)';
        await client.query(queryText, [
          quizId,
          quizDataObject.revision,
          quizTaker,
          JSON.stringify(questionsWithoutCorrectAnswers),
          JSON.stringify(correctAnswerIndexes),
          questionsWithAnswers.length,
          quizDataObject.pass_mark_percentage,
        ]);
        console.log('Quiz attempt created for: ', quizTaker);
        await client.query('COMMIT');
        res.status(200).send({ error: '' });
      }
    } catch (err) {
      const e = err as IPostgresError;
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    const error = err as IPostgresError;
    console.error(
      'Error while saving Quiz attempt record to DB: ',
      error.stack
    );
    return res.status(200).send({
      error: 'Unknown error occured while saving Quiz attempt',
      isGeneralError: false,
    });
  }
};

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return inviteQuizTaker(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end('Method Not Allowed');
}
