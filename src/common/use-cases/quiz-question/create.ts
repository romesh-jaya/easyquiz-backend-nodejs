import { v4 as uuidv4 } from 'uuid';
import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { IResponse } from '../../interfaces/Other/IResponse';
import { QuizQuestion } from '../../types/QuizQuestion';
import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';

export default class CreateQuizQuestion {
  constructor(
    protected quizQuestionDAO: IQuizQuestionDAO,
    protected quizDAO: IQuizDAO
  ) {}

  async call(data: Partial<QuizQuestion>, userId: string): Promise<IResponse> {
    if (!data.quizId || !data.questionContent || !data.answers) {
      throw new Error(
        'Error: quizId, questionContent, or answers was found to be empty'
      );
    }

    const uuid = uuidv4();
    data.id = uuid;

    let questionResponse = await this.quizQuestionDAO.create(data, userId);

    if (!questionResponse.error) {
      let quiz = await this.quizDAO.get(data.quizId as string, userId);
      let existingQuestionOrder = (quiz as any).question_order || [];
      existingQuestionOrder.push(uuid);
      await this.quizDAO.updateQuestionOrder(
        data.quizId as string,
        existingQuestionOrder,
        userId
      );
    }

    return questionResponse;
  }
}
