export type QuizResponse = {
  id: string;
  created_by_user: string;
  name: string;
  description: string;
  status: string;
  question_order: string[];
  pass_mark_percentage: number;
  can_retake_quiz: boolean;
  revision: number;
  last_updated: Date;
};
