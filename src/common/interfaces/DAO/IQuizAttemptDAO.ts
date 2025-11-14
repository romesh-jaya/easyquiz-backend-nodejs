import { Quiz } from '../../types/Quiz';
import { QuizAttempt } from '../../types/QuizAttempt';
import { IResponse } from '../Other/IResponse';

export interface IQuizAttemptDAO {
  create(
    quiz: Quiz,
    quizTaker: string,
    questions: string,
    answers: string,
    noOfQuestions: number
  ): Promise<IResponse>;
  get(id: string): Promise<QuizAttempt>;
  getByIdRevisionQuizTaker(
    id: string,
    quizRevision: number,
    quizTaker: string
  ): Promise<QuizAttempt>;
}
