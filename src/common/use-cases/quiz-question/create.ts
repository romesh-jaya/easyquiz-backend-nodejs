import { v4 as uuidv4 } from 'uuid';
import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { IResponse } from '../../interfaces/Other/IResponse';
import { QuizQuestion } from '../../types/QuizQuestion';

export default class CreateQuizQuestion {
  constructor(protected quizQuestionDAO: IQuizQuestionDAO) {}

  async call(data: Partial<QuizQuestion>, userId: string): Promise<IResponse> {
    if (!data.quizId || !data.questionContent || !data.answers) {
      throw new Error(
        'Error: quizId, questionContent, or answers was found to be empty'
      );
    }

    const uuid = uuidv4();
    data.id = uuid;

    return this.quizQuestionDAO.create(data, userId);
  }
}
