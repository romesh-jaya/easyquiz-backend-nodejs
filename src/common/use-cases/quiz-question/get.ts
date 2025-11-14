import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { QuizQuestion } from '../../types/QuizQuestion';

export default class GetQuizQuestion {
  constructor(protected quizQuestionDAO: IQuizQuestionDAO) {}

  async call(id: string, userId: string): Promise<QuizQuestion> {
    if (!id) {
      throw new Error('Error: id was found to be empty');
    }

    return this.quizQuestionDAO.get(id, userId);
  }
}
