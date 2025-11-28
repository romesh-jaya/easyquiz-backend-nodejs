import { IResponse } from '../interfaces/Other/IResponse';
import { QuizQuestion } from '../types/Request/QuizQuestion';
import CreateQuizQuestion from '../use-cases/quiz-question/create';
import GetQuizQuestion from '../use-cases/quiz-question/get';
import UpdateQuizQuestion from '../use-cases/quiz-question/update';
import DeleteQuizQuestion from '../use-cases/quiz-question/delete';

export default class QuizQuestionController {
  constructor(
    protected createQuizQuestion: CreateQuizQuestion,
    protected getQuizQuestion: GetQuizQuestion,
    protected updateQuizQuestion: UpdateQuizQuestion,
    protected deleteQuizQuestion: DeleteQuizQuestion
  ) {}

  async create(
    data: Partial<QuizQuestion>,
    userId: string
  ): Promise<IResponse> {
    return this.createQuizQuestion.call(data, userId);
  }

  async update(
    data: Partial<QuizQuestion>,
    userId: string
  ): Promise<IResponse> {
    return this.updateQuizQuestion.call(data, userId);
  }

  async get(id: string, userId: string): Promise<QuizQuestion> {
    return this.getQuizQuestion.call(id, userId);
  }

  async delete(id: string, userId: string): Promise<IResponse> {
    return this.deleteQuizQuestion.call(id, userId);
  }
}
