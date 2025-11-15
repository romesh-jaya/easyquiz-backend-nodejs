import QuizQuestionController from '../../../controllers/quiz-question';
import CreateQuizQuestion from '../../../use-cases/quiz-question/create';
import GetQuizQuestion from '../../../use-cases/quiz-question/get';
import UpdateQuizQuestion from '../../../use-cases/quiz-question/update';
import QuizQuestionPostgresDAO from '../quizQuestion';

let quizQuestionDAO = new QuizQuestionPostgresDAO();

let controller = new QuizQuestionController(
  new CreateQuizQuestion(quizQuestionDAO),
  new GetQuizQuestion(quizQuestionDAO),
  new UpdateQuizQuestion(quizQuestionDAO)
);

export default controller;
