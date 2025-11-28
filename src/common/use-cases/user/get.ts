import { IUserDAO } from '../../interfaces/DAO/IUserDAO';
import { UserInfoResponse } from '../../types/Response/UserInfoResponse';

export default class GetUser {
  constructor(protected userDAO: IUserDAO) {}

  async get(userId: string): Promise<UserInfoResponse> {
    return this.userDAO.get(userId);
  }
}
