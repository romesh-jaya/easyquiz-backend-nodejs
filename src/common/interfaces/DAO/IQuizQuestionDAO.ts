import { QuizQuestion } from '../../types/Request/QuizQuestion';
import { IResponse } from '../Other/IResponse';

export interface IQuizQuestionDAO {
  create(data: Partial<QuizQuestion>, userId: string): Promise<IResponse>;
  get(id: string, userId: string): Promise<QuizQuestion>;
  update(data: Partial<QuizQuestion>, userId: string): Promise<IResponse>;
  delete(id: string, userId: string): Promise<IResponse>;
}
