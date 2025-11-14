import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IPostgresError } from '../../interfaces/Other/IPostgresError';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { Quiz } from '../../types/Quiz';
import { Logger } from '../logger/logger';

export default class QuizPostgresDAO implements IQuizDAO {
  logger;
  constructor() {
    this.logger = new Logger();
  }

  async create(data: Partial<Quiz>, userId: string): Promise<IResponse> {
    throw new Error('Method not implemented.');
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
