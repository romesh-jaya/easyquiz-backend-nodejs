import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, { controller } from '../pages/api/auth/users/get';

// Mock CORS middleware
jest.mock('../common/infrastructure/express/middleware/cors', () => ({
  runCorsMiddleware: jest.fn((req, res) => Promise.resolve()),
}));

// Mock auth utility
jest.mock('../common/utils/auth', () => ({
  getUserIDFromAuthToken: jest.fn(),
}));

// Mock the controller
jest.mock(
  '../common/infrastructure/postgres/controllers/postgres-user-controller'
);

describe('/api/auth/users/get', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    test('should return user data for authenticated user', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      const mockUserData = {
        userId: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.get as jest.Mock).mockResolvedValue(mockUserData);

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual(mockUserData);
      expect(controller.get).toHaveBeenCalledWith('user-123');
    });

    test('should return 400 when user authentication fails', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({
        error: 'Invalid token',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getResponseBody()).toBe('Invalid token');
    });

    test('should return 400 when user data not found', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.get as jest.Mock).mockResolvedValue(null);

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getResponseBody()).toContain('no userdata was found');
    });

    test('should handle unexpected error with 500 status', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockRejectedValue(
        new Error('Database connection failed')
      );

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.getResponseBody()).toBe('Database connection failed');
    });

    test('should handle controller error gracefully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.get as jest.Mock).mockRejectedValue(
        new Error('Controller error')
      );

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.getResponseBody()).toBe('Controller error');
    });
  });

  describe('OPTIONS', () => {
    test('should return 200 for OPTIONS request', async () => {
      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'OPTIONS',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
    });
  });
});
