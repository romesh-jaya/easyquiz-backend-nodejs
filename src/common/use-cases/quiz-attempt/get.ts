import { IQuizAttemptDAO } from '../../interfaces/DAO/IQuizAttemptDAO';
import { QuizAttempt } from '../../types/Request/QuizAttempt';
import { QuizAttemptResponse } from '../../types/Response/QuizAttemptResponse';

export default class GetQuizAttempt {
  constructor(protected quizAttemptDAO: IQuizAttemptDAO) {}

  async get(id: string, userId: string): Promise<QuizAttemptResponse> {
    return this.quizAttemptDAO.get(id, userId);
  }

  async getByIdRevisionQuizTaker(
    id: string,
    quizRevision: number,
    quizTaker: string,
    userId: string
  ): Promise<QuizAttemptResponse> {
    return this.quizAttemptDAO.getByIdRevisionQuizTaker(
      id,
      quizRevision,
      quizTaker,
      userId
    );
  }
}
