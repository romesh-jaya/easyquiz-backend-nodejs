import { QuizAttempt } from '../../types/QuizAttempt';
import { IResponse } from '../IResponse';

export interface IQuizAttemptDAO {
  create(data: Partial<QuizAttempt>): Promise<IResponse>;
  get(id: string): Promise<QuizAttempt>;
}
