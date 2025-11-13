import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { Quiz } from '../../types/Quiz';

export default class GetQuiz {
  constructor(protected quizDAO: IQuizDAO) {}

  async call(id: string): Promise<Quiz> {
    return this.quizDAO.get(id);
  }
}
