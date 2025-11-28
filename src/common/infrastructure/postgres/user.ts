import { MESSAGE_SUCCESS } from '../../constants/messages';
import { IUserDAO } from '../../interfaces/DAO/IUserDAO';
import { IPostgresError } from '../../interfaces/Other/IPostgresError';
import { IResponse } from '../../interfaces/Other/IResponse';
import postgresClient from '../../postgres';
import { UserInfo } from '../../types/Request/UserInfo';
import { UserInfoResponse } from '../../types/Response/UserInfoResponse';
import { Logger } from '../logger/logger';

export default class UserPostgresDAO implements IUserDAO {
  logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  private async getByEmail(email: string): Promise<UserInfoResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText = 'SELECT * FROM public.quiz_user WHERE email = $1';
        const data = await client.query(queryText, [email]);
        return data?.rows?.[0];
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error querying quiz_user table in DB: ' + error.stack);
      throw new Error('Error querying quiz_user table in DB');
    }
  }

  async create(data: Partial<UserInfo>): Promise<IResponse> {
    try {
      // Check if email already exists
      const existingUser = await this.getByEmail(data.email ?? '');
      if (existingUser) {
        return {
          error: 'Email address is already in use',
          isGeneralError: true,
        };
      }

      const client = await postgresClient.connect();
      try {
        await client.query('BEGIN');
        const queryText =
          'INSERT INTO public.quiz_user(id, email, first_name, last_name) VALUES ($1, $2, $3, $4)';
        await client.query(queryText, [
          data.userId,
          data.email,
          data.firstName,
          data.lastName,
        ]);
        await client.query('COMMIT');
        return {
          message: MESSAGE_SUCCESS,
          data: { userId: data.userId },
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error(
        'Error while inserting User record to DB: ' + error.stack
      );
      return {
        error: 'Unknown error occurred while saving User',
        isGeneralError: false,
      };
    }
  }

  async get(userId: string): Promise<UserInfoResponse> {
    try {
      const client = await postgresClient.connect();
      try {
        const queryText = 'SELECT * FROM public.quiz_user WHERE id = $1';
        const data = await client.query(queryText, [userId]);
        return data?.rows?.[0];
      } finally {
        client.release();
      }
    } catch (err) {
      const error = err as IPostgresError;
      this.logger.error('Error querying quiz_user table in DB: ' + error.stack);
      throw new Error('Error querying quiz_user table in DB');
    }
  }
}
