import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/Other/IResponse';
import { Quiz } from '../../types/Quiz';

export default class QuizPostgresDAO implements IQuizDAO {
  create(data: Partial<Quiz>, userId: string): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }
  get(id: string, userId: string): Promise<Quiz> {
    throw new Error('Method not implemented.');
  }
  getQuizWithDetails(id: string, userId: string): Promise<Quiz> {
    throw new Error('Method not implemented.');
  }
  updateQuizStatus(
    quizId: string,
    quizStatus: string,
    userId: string
  ): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }
  updateQuestionOrder(
    quizId: string,
    questionOrder: string[],
    userId: string
  ): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }
  inviteQuizTaker(
    quizId: string,
    quizTaker: string,
    userId: string
  ): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }
  getQuizzesForUser(userId: string): Promise<Quiz[]> {
    throw new Error('Method not implemented.');
  }
  getOthersQuizzesWithoutCorrectAnswersForUser(
    userId: string
  ): Promise<Quiz[]> {
    throw new Error('Method not implemented.');
  }
}
