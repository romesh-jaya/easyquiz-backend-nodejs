import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { QuizQuestion } from '../../types/QuizQuestion';

export default class GetQuizQuestion {
  constructor(protected quizQuestionDAO: IQuizQuestionDAO) {}

  async call(id: string, userId: string): Promise<QuizQuestion> {
    return this.quizQuestionDAO.get(id, userId);
  }
}
