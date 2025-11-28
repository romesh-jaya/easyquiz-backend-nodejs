import { IQuizAttemptDAO } from '../../interfaces/DAO/IQuizAttemptDAO';
import { IAnswer } from '../../interfaces/Other/IAnswer';
import { IQuestionWithoutCorrectAnswers } from '../../interfaces/Other/IQuestionWithoutCorrectAnswers';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { Quiz } from '../../types/Request/Quiz';
import { QuizAttempt } from '../../types/Request/QuizAttempt';
import { getQuestionsForQuizInOrder } from '../../utils/questions';

export default class CreateQuizAttempt {
  constructor(protected quizAttemptDAO: IQuizAttemptDAO) {}

  async call(
    quiz: Quiz,
    quizTaker: string,
    userId: string
  ): Promise<IResponse> {
    if (!quizTaker || !quiz) {
      throw new Error('Error: quizTaker or quiz was found to be empty');
    }

    const correctAnswerIndexes: number[] = [];
    const questionsWithoutCorrectAnswers: IQuestionWithoutCorrectAnswers[] = [];
    const questionsWithAnswers = await getQuestionsForQuizInOrder(
      postgresClient,
      quiz.id,
      quiz.questionOrder
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

    let quizAttempt: Partial<QuizAttempt> = {
      quizId: quiz.id,
      quizTaker: quizTaker,
      questions: JSON.stringify(questionsWithoutCorrectAnswers),
      answers: JSON.stringify(correctAnswerIndexes),
      noOfQuestions: questionsWithAnswers.length,
    };

    return this.quizAttemptDAO.create(quizAttempt, userId);
  }
}
