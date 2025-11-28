import { IResponse } from '../interfaces/Other/IResponse';
import { Quiz } from '../types/Request/Quiz';
import CreateQuiz from '../use-cases/quiz/create';
import GetQuiz from '../use-cases/quiz/get';
import InviteQuizTaker from '../use-cases/quiz/inviteQuizTaker';
import UpdateQuiz from '../use-cases/quiz/update';
import UpdateQuestionOrder from '../use-cases/quiz/updateQuestionOrder';
import UpdateQuizStatus from '../use-cases/quiz/updateQuizStatus';

export default class QuizController {
  constructor(
    protected createQuiz: CreateQuiz,
    protected getQuiz: GetQuiz,
    protected updateQuiz: UpdateQuiz,
    protected inviteQuizTakerUC: InviteQuizTaker,
    protected updateQuestionOrderUC: UpdateQuestionOrder,
    protected updateQuizStatusUC: UpdateQuizStatus
  ) {}

  async create(data: Partial<Quiz>, userId: string): Promise<IResponse> {
    return this.createQuiz.call(data, userId);
  }

  async update(data: Partial<Quiz>, userId: string): Promise<IResponse> {
    return this.updateQuiz.call(data, userId);
  }

  async get(id: string, userId: string): Promise<Quiz> {
    return this.getQuiz.get(id, userId);
  }

  async getQuizWithDetails(id: string, userId: string): Promise<Quiz> {
    return this.getQuiz.getQuizWithDetails(id, userId);
  }

  async updateQuizStatus(
    quizId: string,
    quizStatus: string,
    userId: string
  ): Promise<IResponse> {
    return this.updateQuizStatusUC.call(quizId, quizStatus, userId);
  }

  async updateQuestionOrder(
    quizId: string,
    questionOrder: string[],
    userId: string
  ): Promise<IResponse> {
    return this.updateQuestionOrderUC.call(quizId, questionOrder, userId);
  }

  async inviteQuizTaker(
    quizId: string,
    quizTaker: string,
    userId: string
  ): Promise<IResponse> {
    return this.inviteQuizTakerUC.call(quizId, quizTaker, userId);
  }

  async getQuizzesForUser(userId: string): Promise<Quiz[]> {
    return this.getQuiz.getQuizzesForUser(userId);
  }

  async getOthersQuizzesWithoutCorrectAnswersForUser(
    userId: string
  ): Promise<Quiz[]> {
    return this.getQuiz.getOthersQuizzesWithoutCorrectAnswersForUser(userId);
  }
}
