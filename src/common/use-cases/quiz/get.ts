import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { Quiz } from '../../types/Quiz';

export default class GetQuiz {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(id: string): Promise<Quiz> {
    return await this.quizDAO.get(id);
  }
}
