export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_content: string;
  answers: string;
  revision: number;
  last_updated: Date;
};
