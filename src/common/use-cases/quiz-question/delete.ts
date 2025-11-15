import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { IResponse } from '../../interfaces/Other/IResponse';

export default class DeleteQuizQuestion {
  constructor(protected quizQuestionDAO: IQuizQuestionDAO) {}

  async call(id: string, userId: string): Promise<IResponse> {
    if (!id) {
      throw new Error('Error: id was found to be empty');
    }

    return this.quizQuestionDAO.delete(id, userId);
  }
}
