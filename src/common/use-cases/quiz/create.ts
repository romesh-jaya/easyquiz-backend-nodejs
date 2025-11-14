import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/Other/IResponse';
import { Quiz } from '../../types/Quiz';

export default class CreateQuiz {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(payload: Partial<Quiz>): Promise<IResponse> {
    if (!payload.name || !payload.description || !payload.passMarkPercentage) {
      throw new Error(
        'Error: quizName, description or passMarkPercentage was found to be empty'
      );
    }

    return this.quizDAO.create(payload);
  }
}
