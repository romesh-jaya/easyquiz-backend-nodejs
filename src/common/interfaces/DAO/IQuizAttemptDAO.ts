import { Quiz } from '../../types/Request/Quiz';
import { QuizAttempt } from '../../types/Request/QuizAttempt';
import { QuizAttemptResponse } from '../../types/Response/QuizAttemptResponse';
import { IResponse } from '../Other/IResponse';

export interface IQuizAttemptDAO {
  create(data: Partial<QuizAttempt>, userId: string): Promise<IResponse>;
  get(id: string, userId: string): Promise<QuizAttemptResponse>;
  getByIdRevisionQuizTaker(
    id: string,
    quizRevision: number,
    quizTaker: string,
    userId: string
  ): Promise<QuizAttemptResponse>;
}
