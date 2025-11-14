import { Quiz } from '../../types/Quiz';
import { IResponse } from '../Other/IResponse';

export interface IQuizDAO {
  create(data: Partial<Quiz>): Promise<IResponse>;
  get(id: string): Promise<Quiz>;
  getQuizWithDetails(id: string): Promise<Quiz>;
  updateQuizStatus(quizId: string, quizStatus: string): Promise<IResponse>;
  updateQuestionOrder(
    quizId: string,
    questionOrder: string[]
  ): Promise<IResponse>;
  inviteQuizTaker(quizId: string, quizTaker: string): Promise<IResponse>;
  getQuizzesForUser(): Promise<Quiz[]>;
  getQuizWithDetails(quizId: string): Promise<Quiz>;
}
