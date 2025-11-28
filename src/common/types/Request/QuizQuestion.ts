export type QuizQuestion = {
  id: string;
  quizId: string;
  questionContent: string;
  answers: string;
  revision: number;
  lastUpdated: Date;
};
