import { IResponse } from '../interfaces/Other/IResponse';
import { UserInfo } from '../types/Request/UserInfo';
import { UserInfoResponse } from '../types/Response/UserInfoResponse';
import CreateUser from '../use-cases/user/create';
import GetUser from '../use-cases/user/get';

export default class UserController {
  constructor(protected createUser: CreateUser, protected getUser: GetUser) {}

  async create(data: Partial<UserInfo>): Promise<IResponse> {
    return this.createUser.call(data);
  }

  async get(userId: string): Promise<UserInfoResponse> {
    return this.getUser.get(userId);
  }
}
