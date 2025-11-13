import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/IResponse';

export default class inviteQuizTaker {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(quizId: string, quizTaker: string): Promise<IResponse> {
    if (!quizTaker) {
      throw new Error('Error: quizTaker was found to be empty');
    }

    const quizDataObject = await this.quizDAO.get(quizId);

    if (!quizDataObject) {
      throw new Error(`Error: quizId ${quizId} does not exist`);
    }

    return this.quizDAO.inviteQuizTaker(quizId, quizTaker);
  }
}
