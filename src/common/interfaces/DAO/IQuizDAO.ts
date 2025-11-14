import { Quiz } from '../../types/Quiz';
import { IResponse } from '../Other/IResponse';

export interface IQuizDAO {
  create(data: Partial<Quiz>, userId: string): Promise<IResponse>;
  get(id: string, userId: string): Promise<Quiz>;
  getQuizWithDetails(id: string, userId: string): Promise<Quiz>;
  updateQuizStatus(
    quizId: string,
    quizStatus: string,
    userId: string
  ): Promise<IResponse>;
  updateQuestionOrder(
    quizId: string,
    questionOrder: string[],
    userId: string
  ): Promise<IResponse>;
  inviteQuizTaker(
    quizId: string,
    quizTaker: string,
    userId: string
  ): Promise<IResponse>;
  getQuizzesForUser(userId: string): Promise<Quiz[]>;
}
