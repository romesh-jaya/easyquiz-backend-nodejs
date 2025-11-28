import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { QuizQuestion } from '../../types/Request/QuizQuestion';
import { QuizQuestionResponse } from '../../types/Response/QuizQuestionResponse';

export default class GetQuizQuestion {
  constructor(protected quizQuestionDAO: IQuizQuestionDAO) {}

  async call(id: string, userId: string): Promise<QuizQuestionResponse> {
    return this.quizQuestionDAO.get(id, userId);
  }
}
