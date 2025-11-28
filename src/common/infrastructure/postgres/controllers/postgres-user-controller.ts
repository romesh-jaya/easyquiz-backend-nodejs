import UserController from '../../../controllers/user';
import CreateUser from '../../../use-cases/user/create';
import GetUser from '../../../use-cases/user/get';
import UserPostgresDAO from '../user';

let userDAO = new UserPostgresDAO();

let controller = new UserController(
  new CreateUser(userDAO),
  new GetUser(userDAO)
);

export default controller;
