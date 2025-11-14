import { Quiz } from '../../types/Quiz';
import { QuizAttempt } from '../../types/QuizAttempt';
import { IResponse } from '../Other/IResponse';

export interface IQuizAttemptDAO {
  create(
    quiz: Quiz,
    quizTaker: string,
    questions: string,
    answers: string,
    noOfQuestions: number,
    userId: string
  ): Promise<IResponse>;
  get(id: string, userId: string): Promise<QuizAttempt>;
  getByIdRevisionQuizTaker(
    id: string,
    quizRevision: number,
    quizTaker: string,
    userId: string
  ): Promise<QuizAttempt>;
}
