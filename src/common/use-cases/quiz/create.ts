import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/IResponse';
import { MESSAGE_SUCCESS } from '../../constants/messages';
import { Quiz } from '../../types/Quiz';

export default class CreateQuiz {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(payload: Partial<Quiz>): Promise<IResponse> {
    if (!payload.name || !payload.description || !payload.passMarkPercentage) {
      throw new Error(
        'Error: quizName, description or passMarkPercentage was found to be empty'
      );
    }

    return {
      message: MESSAGE_SUCCESS,
      data: await this.quizDAO.create(payload),
    };
  }
}
