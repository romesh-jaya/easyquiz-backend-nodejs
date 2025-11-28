import { IUserDAO } from '../../interfaces/DAO/IUserDAO';
import { IResponse } from '../../interfaces/Other/IResponse';
import { UserInfo } from '../../types/Request/UserInfo';

export default class CreateUser {
  constructor(protected userDAO: IUserDAO) {}

  async call(payload: Partial<UserInfo>): Promise<IResponse> {
    if (!payload.email || !payload.firstName || !payload.lastName) {
      throw new Error(
        'Error: email, firstName, or lastName was found to be empty'
      );
    }

    return this.userDAO.create(payload);
  }
}
