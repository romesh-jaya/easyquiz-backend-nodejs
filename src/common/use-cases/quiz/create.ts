import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/Other/IResponse';
import { Quiz } from '../../types/Request/Quiz';
import { v4 as uuidv4 } from 'uuid';

export default class CreateQuiz {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(payload: Partial<Quiz>, userId: string): Promise<IResponse> {
    if (!payload.name || !payload.description || !payload.passMarkPercentage) {
      throw new Error(
        'Error: quizName, description or passMarkPercentage was found to be empty'
      );
    }

    const uuid = uuidv4();
    payload.id = uuid;
    return this.quizDAO.create(payload, userId);
  }
}
