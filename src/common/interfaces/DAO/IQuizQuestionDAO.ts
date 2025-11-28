import { QuizQuestion } from '../../types/Request/QuizQuestion';
import { QuizQuestionResponse } from '../../types/Response/QuizQuestionResponse';
import { IResponse } from '../Other/IResponse';

export interface IQuizQuestionDAO {
  create(data: Partial<QuizQuestion>, userId: string): Promise<IResponse>;
  get(id: string, userId: string): Promise<QuizQuestionResponse>;
  update(data: Partial<QuizQuestion>, userId: string): Promise<IResponse>;
  delete(id: string, userId: string): Promise<IResponse>;
}
