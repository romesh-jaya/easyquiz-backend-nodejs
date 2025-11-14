import { IQuizAttemptDAO } from '../../interfaces/DAO/IQuizAttemptDAO';
import { IAnswer } from '../../interfaces/Other/IAnswer';
import { IQuestionWithoutCorrectAnswers } from '../../interfaces/Other/IQuestionWithoutCorrectAnswers';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { Quiz } from '../../types/Quiz';
import { getQuestionsForQuizInOrder } from '../../utils/questions';

export default class CreateQuizAttempt {
  constructor(protected quizAttemptDAO: IQuizAttemptDAO) {}

  async call(quiz: Quiz, quizTaker: string): Promise<IResponse> {
    if (!quizTaker || !quiz) {
      throw new Error('Error: quizTaker or quiz was found to be empty');
    }

    const correctAnswerIndexes: number[] = [];
    const questionsWithoutCorrectAnswers: IQuestionWithoutCorrectAnswers[] = [];
    const questionsWithAnswers = await getQuestionsForQuizInOrder(
      postgresClient,
      quiz.id,
      quiz.question_order
    );

    questionsWithAnswers.forEach((questionWithAnswer) => {
      const answers = JSON.parse(questionWithAnswer.answers);
      questionsWithoutCorrectAnswers.push({
        id: questionWithAnswer.id,
        answers: answers.map((answer: IAnswer) => answer.answer),
        questionContent: questionWithAnswer.questionContent,
        revision: questionWithAnswer.revision,
      });
      correctAnswerIndexes.push(
        answers.map((answer: IAnswer) => answer.isCorrect)
      );
    });

    return this.quizAttemptDAO.create(
      quiz,
      quizTaker,
      JSON.stringify(questionsWithoutCorrectAnswers),
      JSON.stringify(correctAnswerIndexes),
      questionsWithAnswers.length
    );
  }
}
