import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/Other/IResponse';
import { Quiz } from '../../types/Quiz';

export default class UpdateQuiz {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(payload: Partial<Quiz>, userId: string): Promise<IResponse> {
    if (!payload.name || !payload.description || !payload.passMarkPercentage) {
      throw new Error(
        'Error: quizName, description or passMarkPercentage was found to be empty'
      );
    }

    return this.quizDAO.update(payload, userId);
  }
}
