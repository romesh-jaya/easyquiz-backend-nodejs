import { Quiz } from '../../types/Quiz';
import { IResponse } from '../IResponse';

export interface IQuizDAO {
  create(data: Partial<Quiz>): Promise<IResponse>;
  get(id: string): Promise<Quiz>;
  updateQuizStatus(quizId: string, quizStatus: string): Promise<IResponse>;
  updateQuestionOrder(
    quizId: string,
    questionOrder: string[]
  ): Promise<IResponse>;
  inviteQuizTaker(quizId: string, quizTaker: string): Promise<IResponse>;
  getQuizzesForUser(): Promise<IResponse>;
  getQuizWithDetails(quizId: string): Promise<IResponse>;
}
