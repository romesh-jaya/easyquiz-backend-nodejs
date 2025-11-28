import { MESSAGE_SUCCESS } from '../../constants/messages';
import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { IPostgresError } from '../../interfaces/Other/IPostgresError';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { QuizQuestion } from '../../types/Request/QuizQuestion';
import { QuizQuestionResponse } from '../../types/Response/QuizQuestionResponse';
import { Logger } from '../logger/logger';
import QuizPostgresDAO from './quiz';

export default class QuizQuestionPostgresDAO implements IQuizQuestionDAO {
  logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  async create(
    data: Partial<QuizQuestion>,
    userId: string
  ): Promise<IResponse> {
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
          'INSERT INTO public.quiz_question(id, quiz_id, question_content, answers) VALUES ($1, $2, $3, $4)';
        await client.query(queryText, [
          data.id,
          data.quizId,
          data.questionContent,
          data.answers,
        ]);
        await client.query('COMMIT');
        return { message: MESSAGE_SUCCESS, data: { id: data.id } };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error while creating quiz question: ' + error.stack);
      return {
        error: 'Unknown error occurred while creating quiz question',
        isGeneralError: false,
      };
    }
  }

  async get(id: string, userId: string): Promise<QuizQuestionResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText =
          'SELECT * FROM public.quiz_question WHERE id = $1 AND quiz_id IN (SELECT id FROM public.quiz WHERE created_by_user = $2)';
        const data = await client.query(queryText, [id, userId]);
        if (data.rows.length === 0) {
          throw new Error(
            'Quiz question not found or you do not have permission to view it.'
          );
        }
        return data.rows[0];
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error while fetching quiz question: ' + error.stack);
      throw new Error('Error while fetching quiz question');
    }
  }

  async update(
    data: Partial<QuizQuestion>,
    userId: string
  ): Promise<IResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');
        const queryText =
          'UPDATE public.quiz_question SET question_content = $1, answers = $2 WHERE id = $3 AND quiz_id IN (SELECT id FROM public.quiz WHERE created_by_user = $4)';
        const result = await client.query(queryText, [
          data.questionContent,
          data.answers,
          data.id,
          userId,
        ]);

        if (result.rowCount === 0) {
          return {
            error:
              'Quiz question not found or you do not have permission to update it.',
            isGeneralError: true,
          };
        }

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
      this.logger.error('Error while updating quiz question: ' + error.stack);
      return {
        error: 'Unknown error occurred while updating quiz question',
        isGeneralError: false,
      };
    }
  }

  async delete(id: string, userId: string): Promise<IResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');
        const queryText =
          'DELETE FROM public.quiz_question WHERE id = $1 AND quiz_id IN (SELECT id FROM public.quiz WHERE created_by_user = $2)';

        const result = await client.query(queryText, [id, userId]);

        if (result.rowCount === 0) {
          return {
            error:
              'Quiz question not found or you do not have permission to delete it.',
            isGeneralError: true,
          };
        }

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
      this.logger.error('Error while deleting quiz question: ' + error.stack);
      return {
        error: 'Unknown error occurred while deleting quiz question',
        isGeneralError: false,
      };
    }
  }
}
