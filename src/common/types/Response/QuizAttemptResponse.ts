export type QuizAttemptResponse = {
  quiz_id: string;
  quiz_revision: number;
  quiz_taker: string;
  status: string;
  questions: string;
  answers?: string;
  next_question_index?: number;
  no_of_questions: number;
  no_of_correct_answers: number;
  pass_percentage: number;
  score_percentage?: number;
  last_updated: Date;
};
