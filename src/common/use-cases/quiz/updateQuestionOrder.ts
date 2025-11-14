import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/Other/IResponse';

export default class updateQuestionOrder {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(quizId: string, questionOrder: string[]): Promise<IResponse> {
    if (!questionOrder) {
      throw new Error('Error: questionOrder was found to be empty');
    }

    if (!Array.isArray(questionOrder)) {
      throw new Error('Error: questionOrder must be an array');
    }

    return this.quizDAO.updateQuestionOrder(quizId, questionOrder);
  }
}
