import { UserInfo } from '../../types/Request/UserInfo';
import { UserInfoResponse } from '../../types/Response/UserInfoResponse';
import { IResponse } from '../Other/IResponse';

export interface IUserDAO {
  create(data: Partial<UserInfo>): Promise<IResponse>;
  get(userId: string): Promise<UserInfoResponse>;
}
