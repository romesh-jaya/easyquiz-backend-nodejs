import { IQuizAttemptDAO } from '../../interfaces/DAO/IQuizAttemptDAO';
import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/Other/IResponse';

export default class inviteQuizTaker {
  constructor(
    protected quizDAO: IQuizDAO,
    protected quizAttemptDAO: IQuizAttemptDAO
  ) {}

  async call(quizId: string, quizTaker: string): Promise<IResponse> {
    if (!quizTaker) {
      throw new Error('Error: quizTaker was found to be empty');
    }

    const quizDataObject = await this.quizDAO.get(quizId);

    if (!quizDataObject) {
      throw new Error(`Error: quizId ${quizId} does not exist`);
    }

    const quizAttemptObject =
      await this.quizAttemptDAO.getByIdRevisionQuizTaker(
        quizId,
        quizDataObject.revision,
        quizTaker
      );

    if (quizAttemptObject) {
      throw new Error('Error: Quiz attempt already exists for: ' + quizTaker);
    }

    return this.quizDAO.inviteQuizTaker(quizId, quizTaker);
  }
}
