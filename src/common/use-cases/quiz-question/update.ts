import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { IResponse } from '../../interfaces/Other/IResponse';
import { QuizQuestion } from '../../types/Request/QuizQuestion';

export default class UpdateQuizQuestion {
  constructor(protected quizQuestionDAO: IQuizQuestionDAO) {}

  async call(data: Partial<QuizQuestion>, userId: string): Promise<IResponse> {
    if (!data.id || !data.quizId || !data.questionContent || !data.answers) {
      throw new Error(
        'Error: id, quizId, questionContent, or answers was found to be empty'
      );
    }

    return this.quizQuestionDAO.update(data, userId);
  }
}
