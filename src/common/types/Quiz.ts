export type Quiz = {
  id: string;
  created_by_user: string;
  name: string;
  description: string;
  status: string;
  question_order: string[];
  passMarkPercentage: number;
  canRetakeQuiz: boolean;
  revision: number;
  lastUpdated: Date;
};
