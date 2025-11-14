import { MESSAGE_SUCCESS } from '../../constants/messages';
import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IPostgresError } from '../../interfaces/Other/IPostgresError';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { Quiz } from '../../types/Quiz';
import { Logger } from '../logger/logger';
import { v4 as uuidv4 } from 'uuid';

export default class QuizPostgresDAO implements IQuizDAO {
  logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  async create(data: Partial<Quiz>, userId: string): Promise<IResponse> {
    try {
      const uuid = uuidv4();
      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');

        const queryText =
          'INSERT INTO public.quiz(id, created_by_user, name, description, pass_mark_percentage, can_retake_quiz)  VALUES ($1, $2, $3, $4, $5, $6)';
        await client.query(queryText, [
          uuid,
          userId,
          data.name,
          data.description,
          data.passMarkPercentage,
          true,
        ]);
        await client.query('COMMIT');
        return {
          message: MESSAGE_SUCCESS,
          data: { id: uuid },
        };
      } catch (err) {
        const e = err as IPostgresError;
        if (e.code && e.code === '23505') {
          await client.query('ROLLBACK');
          return {
            error: 'Another Quiz already exists with the same name',
            isGeneralError: true,
          };
        }
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.end();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error(
        'Error while inserting Quiz record to DB: ' + error.stack
      );
      return {
        error: 'Unknown error occured while saving Quiz',
        isGeneralError: false,
      };
    }
  }

  async get(id: string, userId: string): Promise<Quiz> {
    try {
      const queryText =
        'SELECT * FROM public.quiz WHERE created_by_user = $1 AND id = $2';
      const data = await postgresClient.query(queryText, [userId, id]);
      return data?.rows;
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error querying quiz table in DB: ' + error.stack);
      throw new Error('Error querying quiz table in DB');
    }
  }

  async getQuizWithDetails(id: string, userId: string): Promise<Quiz> {
    throw new Error('Method not implemented.');
  }

  async updateQuizStatus(
    quizId: string,
    quizStatus: string,
    userId: string
  ): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }
  async updateQuestionOrder(
    quizId: string,
    questionOrder: string[],
    userId: string
  ): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }
  async inviteQuizTaker(
    quizId: string,
    quizTaker: string,
    userId: string
  ): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }
  async getQuizzesForUser(userId: string): Promise<Quiz[]> {
    throw new Error('Method not implemented.');
  }
  async getOthersQuizzesWithoutCorrectAnswersForUser(
    userId: string
  ): Promise<Quiz[]> {
    throw new Error('Method not implemented.');
  }
}
