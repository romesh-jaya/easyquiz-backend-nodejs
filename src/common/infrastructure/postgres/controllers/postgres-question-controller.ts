import QuizQuestionController from '../../../controllers/quiz-question';
import CreateQuizQuestion from '../../../use-cases/quiz-question/create';
import GetQuizQuestion from '../../../use-cases/quiz-question/get';
import UpdateQuizQuestion from '../../../use-cases/quiz-question/update';
import DeleteQuizQuestion from '../../../use-cases/quiz-question/delete';
import QuizQuestionPostgresDAO from '../quizQuestion';
import QuizPostgresDAO from '../quiz';

let quizQuestionDAO = new QuizQuestionPostgresDAO();
let quizDAO = new QuizPostgresDAO();

let controller = new QuizQuestionController(
  new CreateQuizQuestion(quizQuestionDAO, quizDAO),
  new GetQuizQuestion(quizQuestionDAO),
  new UpdateQuizQuestion(quizQuestionDAO),
  new DeleteQuizQuestion(quizQuestionDAO, quizDAO)
);

export default controller;
