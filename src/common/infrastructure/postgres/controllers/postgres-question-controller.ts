import QuizController from '../../../controllers/quiz';
import CreateQuiz from '../../../use-cases/quiz/create';
import GetQuiz from '../../../use-cases/quiz/get';
import InviteQuizTaker from '../../../use-cases/quiz/inviteQuizTaker';
import UpdateQuiz from '../../../use-cases/quiz/update';
import UpdateQuestionOrder from '../../../use-cases/quiz/updateQuestionOrder';
import UpdateQuizStatus from '../../../use-cases/quiz/updateQuizStatus';
import QuizPostgresDAO from '../quiz';
import QuizAttemptPostgresDAO from '../quizAttempt';

let quizDAO = new QuizPostgresDAO();
let quizAttemptDAO = new QuizAttemptPostgresDAO();

let controller = new QuizController(
  new CreateQuiz(quizDAO),
  new GetQuiz(quizDAO),
  new UpdateQuiz(quizDAO),
  new InviteQuizTaker(quizDAO, quizAttemptDAO),
  new UpdateQuestionOrder(quizDAO),
  new UpdateQuizStatus(quizDAO)
);

export default controller;
