import { Quiz } from '../../types/Request/Quiz';
import { QuizResponse } from '../../types/Response/QuizResponse';
import { IResponse } from '../Other/IResponse';

export interface IQuizDAO {
  create(data: Partial<Quiz>, userId: string): Promise<IResponse>;
  update(data: Partial<Quiz>, userId: string): Promise<IResponse>;
  get(id: string, userId: string): Promise<QuizResponse>;
  getQuizWithDetails(id: string, userId: string): Promise<QuizResponse>;

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
  getQuizzesForUser(userId: string): Promise<QuizResponse[]>;
  getOthersQuizzesWithoutCorrectAnswersForUser(
    userId: string
  ): Promise<QuizResponse[]>;
}
