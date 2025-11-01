import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IResponse } from '../../interfaces/IResponse';
import { MESSAGE_SUCCESS } from '../../constants/messages';
import { QuizStatus } from '../../enums/QuizStatus';

export default class UpdateQuizStatus {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(quizId: string, quizStatus: string): Promise<IResponse> {
    const statusValues = Object.values(QuizStatus);

    if (!quizStatus) {
      throw new Error('Error: status was found to be empty');
    }

    if (!statusValues.includes(quizStatus as unknown as QuizStatus)) {
      throw new Error(
        `Error: status was not one of the values: ${statusValues}`
      );
    }

    const quizToUpdate = await this.quizDAO.get(quizId);

    if (
      !(
        (quizToUpdate.status === QuizStatus.Unpublished &&
          quizStatus === QuizStatus.Published) ||
        (quizToUpdate.status === QuizStatus.Published &&
          quizStatus === QuizStatus.Unpublished) ||
        quizStatus === QuizStatus.Archived
      )
    ) {
      throw new Error(
        `Error: status change is invalid from ${quizToUpdate.status} to ${quizStatus}`
      );
    }

    return {
      message: MESSAGE_SUCCESS,
      data: await this.quizDAO.updateQuizStatus(quizId, quizStatus),
    };
  }
}
