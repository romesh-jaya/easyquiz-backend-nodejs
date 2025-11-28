export type QuizAttempt = {
  quizId: string;
  quizRevision: number;
  quizTaker: string;
  status: string;
  questions: string;
  answers?: string;
  nextQuestionIndex?: number;
  noOfQuestions: number;
  noOfCorrectAnswers: number;
  passPercentage: number;
  scorePercentage?: number;
  lastUpdated: Date;
};
