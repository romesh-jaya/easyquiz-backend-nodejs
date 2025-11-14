import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { Quiz } from '../../types/Quiz';

export default class GetQuiz {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(id: string, userId: string): Promise<Quiz> {
    return this.quizDAO.get(id, userId);
  }

  getQuizzesForUser(userId: string): Promise<Quiz[]> {
    return this.quizDAO.getQuizzesForUser(userId);
  }

  getQuizWithDetails(id: string, userId: string): Promise<Quiz> {
    return this.quizDAO.getQuizWithDetails(id, userId);
  }

  getOthersQuizzesWithoutCorrectAnswersForUser(
    userId: string
  ): Promise<Quiz[]> {
    return this.quizDAO.getOthersQuizzesWithoutCorrectAnswersForUser(userId);
  }
}
