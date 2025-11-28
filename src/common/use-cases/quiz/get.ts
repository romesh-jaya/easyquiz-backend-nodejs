import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { Quiz } from '../../types/Request/Quiz';

export default class GetQuiz {
  constructor(protected quizDAO: IQuizDAO) {}

  async get(id: string, userId: string): Promise<Quiz> {
    return this.quizDAO.get(id, userId);
  }

  async getQuizzesForUser(userId: string): Promise<Quiz[]> {
    return this.quizDAO.getQuizzesForUser(userId);
  }

  async getQuizWithDetails(id: string, userId: string): Promise<Quiz> {
    return this.quizDAO.getQuizWithDetails(id, userId);
  }

  async getOthersQuizzesWithoutCorrectAnswersForUser(
    userId: string
  ): Promise<Quiz[]> {
    return this.quizDAO.getOthersQuizzesWithoutCorrectAnswersForUser(userId);
  }
}
