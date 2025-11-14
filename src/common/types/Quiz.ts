export type Quiz = {
  id: string;
  createdByUser: string;
  name: string;
  description: string;
  status: string;
  questionOrder: string[];
  passMarkPercentage: number;
  canRetakeQuiz: boolean;
  revision: number;
  lastUpdated: Date;
};
