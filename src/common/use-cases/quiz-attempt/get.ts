import { IQuizAttemptDAO } from '../../interfaces/DAO/IQuizAttemptDAO';
import { QuizAttempt } from '../../types/QuizAttempt';

export default class GetQuizAttempt {
  constructor(protected quizAttemptDAO: IQuizAttemptDAO) {}

  async get(id: string, userId: string): Promise<QuizAttempt> {
    return this.quizAttemptDAO.get(id, userId);
  }

  async getByIdRevisionQuizTaker(
    id: string,
    quizRevision: number,
    quizTaker: string,
    userId: string
  ): Promise<QuizAttempt> {
    return this.quizAttemptDAO.getByIdRevisionQuizTaker(
      id,
      quizRevision,
      quizTaker,
      userId
    );
  }
}
