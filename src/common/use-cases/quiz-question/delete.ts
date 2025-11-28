import { IQuizDAO } from '../../interfaces/DAO/IQuizDAO';
import { IQuizQuestionDAO } from '../../interfaces/DAO/IQuizQuestionDAO';
import { IResponse } from '../../interfaces/Other/IResponse';

export default class DeleteQuizQuestion {
  constructor(
    protected quizQuestionDAO: IQuizQuestionDAO,
    protected quizDAO: IQuizDAO
  ) {}

  async call(id: string, userId: string): Promise<IResponse> {
    if (!id) {
      throw new Error('Error: id was found to be empty');
    }
    let question = await this.quizQuestionDAO.get(id, userId);
    let questionResponse = await this.quizQuestionDAO.delete(id, userId);

    if (!questionResponse.error) {
      let quiz = await this.quizDAO.get(
        (question as any).quiz_id as string,
        userId
      );
      let existingQuestionOrder = quiz.question_order;
      let newQuestionOrder = existingQuestionOrder.filter(
        (questionId: string) => questionId !== id
      );

      // Shows power of Clean architecture
      await this.quizDAO.updateQuestionOrder(
        question.quiz_id as string,
        newQuestionOrder,
        userId
      );
    }

    return questionResponse;
  }
}
