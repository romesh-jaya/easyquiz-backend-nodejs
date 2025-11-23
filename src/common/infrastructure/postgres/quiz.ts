import { MESSAGE_SUCCESS } from '../../constants/messages';
import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IPostgresError } from '../../interfaces/Other/IPostgresError';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { Quiz } from '../../types/Quiz';
import { Logger } from '../logger/logger';

export default class QuizPostgresDAO implements IQuizDAO {
  logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  async update(data: Partial<Quiz>, userId: string): Promise<IResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');
        const queryText =
          'UPDATE public.quiz SET name = $1, description = $2, pass_mark_percentage = $3 WHERE id = $4 AND created_by_user = $5';
        const result = await client.query(queryText, [
          data.name,
          data.description,
          data.passMarkPercentage,
          data.id,
          userId,
        ]);

        if (result.rowCount === 0) {
          return {
            error: 'Quiz not found or you do not have permission to update it.',
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
      this.logger.error('Error while updating quiz: ' + error.stack);
      return {
        error: 'Unknown error occurred while updating quiz',
        isGeneralError: false,
      };
    }
  }

  async create(data: Partial<Quiz>, userId: string): Promise<IResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');

        const queryText =
          'INSERT INTO public.quiz(id, created_by_user, name, description, pass_mark_percentage, can_retake_quiz)  VALUES ($1, $2, $3, $4, $5, $6)';
        await client.query(queryText, [
          data.id,
          userId,
          data.name,
          data.description,
          data.passMarkPercentage,
          true,
        ]);
        await client.query('COMMIT');
        return {
          message: MESSAGE_SUCCESS,
          data: { id: data.id },
        };
      } catch (err) {
        await client.query('ROLLBACK');
        const e = err as IPostgresError;
        if (e.code && e.code === '23505') {
          return {
            error: 'Another Quiz already exists with the same name',
            isGeneralError: true,
          };
        }
        this.logger.error('Error during transaction: ' + e.stack);
        throw new Error('Transaction failed while creating quiz');
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error(
        'Error while inserting Quiz record to DB: ' + error.stack
      );
      return {
        error: 'Unknown error occurred while saving Quiz',
        isGeneralError: false,
      };
    }
  }

  async get(id: string, userId: string): Promise<Quiz> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText =
          'SELECT * FROM public.quiz WHERE created_by_user = $1 AND id = $2';
        const data = await client.query(queryText, [userId, id]);
        return data?.rows;
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error querying quiz table in DB: ' + error.stack);
      throw new Error('Error querying quiz table in DB');
    }
  }

  async getQuizWithDetails(id: string, userId: string): Promise<Quiz> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText =
          'SELECT * FROM public.quiz WHERE id = $1 AND created_by_user = $2';
        const quizData = await client.query(queryText, [id, userId]);
        const quizDataObject = quizData?.rows[0];

        if (quizDataObject) {
          const questionQuery =
            'SELECT * FROM public.quiz_question WHERE quiz_id = $1';
          const questionData = await client.query(questionQuery, [id]);

          if (questionData?.rows) {
            quizDataObject.questions = quizDataObject.question_order?.map(
              (questionId: string) =>
                questionData.rows.find((q) => q.id === questionId)
            );
          }
          return quizDataObject;
        }
      } finally {
        client.release();
      }
      throw new Error('Quiz not found');
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error querying quiz with details: ' + error.stack);
      throw new Error('Error querying quiz with details');
    }
  }

  async updateQuizStatus(
    quizId: string,
    quizStatus: string,
    userId: string
  ): Promise<IResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');
        const queryText =
          'UPDATE public.quiz SET status = $1 WHERE id = $2 AND created_by_user = $3';
        await client.query(queryText, [quizStatus, quizId, userId]);
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
      this.logger.error('Error updating quiz status: ' + error.stack);
      return {
        error: 'Unknown error occurred while updating quiz status',
        isGeneralError: false,
      };
    }
  }

  async updateQuestionOrder(
    quizId: string,
    questionOrder: string[],
    userId: string
  ): Promise<IResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');
        const queryText =
          'UPDATE public.quiz SET question_order = $1 WHERE id = $2 AND created_by_user = $3';
        await client.query(queryText, [questionOrder, quizId, userId]);
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
      this.logger.error('Error updating question order: ' + error.stack);
      return {
        error: 'Unknown error occurred while updating question order',
        isGeneralError: false,
      };
    }
  }

  async inviteQuizTaker(
    quizId: string,
    quizTaker: string,
    userId: string
  ): Promise<IResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText =
          'INSERT INTO public.quiz_attempt(quiz_id, quiz_taker, quiz_revision) VALUES ($1, $2, (SELECT revision FROM public.quiz WHERE id = $3))';
        await client.query(queryText, [quizId, quizTaker, quizId]);
        return { message: MESSAGE_SUCCESS };
      } catch (err) {
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error inviting quiz taker: ' + error.stack);
      return {
        error: 'Unknown error occurred while inviting quiz taker',
        isGeneralError: false,
      };
    }
  }

  async getQuizzesForUser(userId: string): Promise<Quiz[]> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText =
          'SELECT * FROM public.quiz WHERE created_by_user = $1 ORDER BY last_updated DESC';
        const data = await client.query(queryText, [userId]);
        return data?.rows;
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error fetching quizzes for user: ' + error.stack);
      throw new Error('Error fetching quizzes for user');
    }
  }

  async getOthersQuizzesWithoutCorrectAnswersForUser(
    userId: string
  ): Promise<Quiz[]> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText =
          'SELECT * FROM public.quiz WHERE created_by_user = $1';
        const data = await client.query(queryText, [userId]);
        return data?.rows;
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error fetching others quizzes: ' + error.stack);
      throw new Error('Error fetching others quizzes');
    }
  }
}
