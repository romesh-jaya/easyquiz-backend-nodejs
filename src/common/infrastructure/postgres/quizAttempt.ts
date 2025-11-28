import { MESSAGE_SUCCESS } from '../../constants/messages';
import { IQuizAttemptDAO } from '../../interfaces/DAO/IQuizAttemptDAO';
import { IPostgresError } from '../../interfaces/Other/IPostgresError';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { QuizAttempt } from '../../types/Request/QuizAttempt';
import { QuizAttemptResponse } from '../../types/Response/QuizAttemptResponse';
import { Logger } from '../logger/logger';
import QuizPostgresDAO from './quiz';

export default class QuizAttemptPostgresDAO implements IQuizAttemptDAO {
  logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  async create(data: Partial<QuizAttempt>, userId: string): Promise<IResponse> {
    try {
      const quizDAO = new QuizPostgresDAO();
      const quiz = await quizDAO.get(data.quizId as string, userId);

      if (!quiz) {
        return {
          error: `Quiz with ID ${data.quizId} not found for user ${userId}`,
          isGeneralError: true,
        };
      }

      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');
        const queryText =
          'INSERT INTO public.quiz_attempt(quiz_id, quiz_revision, quiz_taker, questions, answers, no_of_questions, pass_percentage) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        await client.query(queryText, [
          data.quizId,
          data.quizRevision,
          data.quizTaker,
          data.questions,
          data.answers,
          data.noOfQuestions,
          data.passPercentage,
        ]);
        await client.query('COMMIT');
        return { message: MESSAGE_SUCCESS };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error while creating quiz attempt: ' + error.stack);
      return {
        error: 'Unknown error occurred while creating quiz attempt',
        isGeneralError: false,
      };
    }
  }

  async get(id: string, userId: string): Promise<QuizAttemptResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText =
          'SELECT * FROM public.quiz_attempt WHERE quiz_id = $1 AND quiz_taker = $2';
        const data = await client.query(queryText, [id, userId]);
        if (data.rows.length === 0) {
          throw new Error('Quiz attempt not found');
        }
        return data.rows[0];
      } finally {
        client.release();
      }
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
  ): Promise<QuizAttemptResponse> {
    try {
      const queryText =
        'SELECT * FROM public.quiz_attempt WHERE quiz_id = $1 AND quiz_revision = $2 AND quiz_taker = $3';
      const client = await postgresClient.connect();
      try {
        const data = await client.query(queryText, [
          id,
          quizRevision,
          quizTaker,
        ]);
        if (data.rows.length === 0) {
          throw new Error('Quiz attempt not found');
        }
        return data.rows[0];
      } finally {
        client.release();
      }
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
