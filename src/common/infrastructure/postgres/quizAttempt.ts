import { IQuizAttemptDAO } from '../../interfaces/DAO/IQuizAttemptDAO';
import { IPostgresError } from '../../interfaces/Other/IPostgresError';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { Quiz } from '../../types/Quiz';
import { QuizAttempt } from '../../types/QuizAttempt';

export default class QuizAttemptPostgresDAO implements IQuizAttemptDAO {
  async create(
    quiz: Quiz,
    quizTaker: string,
    questions: string,
    answers: string,
    noOfQuestions: number,
    userId: string
  ): Promise<IResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');
        const queryText =
          'INSERT INTO public.quiz_attempt(quiz_id, quiz_revision, quiz_taker, questions, answers, no_of_questions, pass_percentage) VALUES($1, $2, $3, $4, $5, $6, $7)';
        await client.query(queryText, [
          quiz.id,
          quiz.revision,
          quizTaker,
          questions,
          answers,
          noOfQuestions,
          quiz.passMarkPercentage,
        ]);
        await client.query('COMMIT');
        return { message: 'Quiz attempt created successfully' };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.end();
      }
    } catch (err) {
      const error = err as IPostgresError;
      console.error('Error while creating quiz attempt: ', error.stack);
      return {
        error: 'Unknown error occurred while creating quiz attempt',
        isGeneralError: false,
      };
    }
  }

  async get(id: string, userId: string): Promise<QuizAttempt> {
    try {
      const queryText =
        'SELECT * FROM public.quiz_attempt WHERE quiz_id = $1 AND quiz_taker = $2';
      const data = await postgresClient.query(queryText, [id, userId]);
      if (data.rows.length === 0) {
        throw new Error('Quiz attempt not found');
      }
      return data.rows[0];
    } catch (err) {
      const error = err as IPostgresError;
      console.error('Error while fetching quiz attempt: ', error.stack);
      throw new Error('Error while fetching quiz attempt');
    }
  }

  async getByIdRevisionQuizTaker(
    id: string,
    quizRevision: number,
    quizTaker: string,
    userId: string
  ): Promise<QuizAttempt> {
    try {
      const queryText =
        'SELECT * FROM public.quiz_attempt WHERE quiz_id = $1 AND quiz_revision = $2 AND quiz_taker = $3';
      const data = await postgresClient.query(queryText, [
        id,
        quizRevision,
        quizTaker,
      ]);
      if (data.rows.length === 0) {
        throw new Error('Quiz attempt not found');
      }
      return data.rows[0];
    } catch (err) {
      const error = err as IPostgresError;
      console.error(
        'Error while fetching quiz attempt by revision: ',
        error.stack
      );
      throw new Error('Error while fetching quiz attempt by revision');
    }
  }
}
