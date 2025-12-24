import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, { controller } from '../pages/api/auth/my-quizzes/index';

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
  '../common/infrastructure/postgres/controllers/postgres-quiz-controller'
);

describe('/api/auth/my-quizzes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    test('should return 200 with list of quizzes for authenticated user', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      const mockQuizzes = [
        {
          id: 'quiz-1',
          name: 'Math Quiz',
          description: 'Basic Math',
        },
      ];

      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.getQuizzesForUser as jest.Mock).mockResolvedValue(
        mockQuizzes
      );

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual(mockQuizzes);
      expect(controller.getQuizzesForUser).toHaveBeenCalledWith('user-123');
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

    test('should handle controller error gracefully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.getQuizzesForUser as jest.Mock).mockResolvedValue({
        error: 'Database error',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Database error' });
    });
  });

  describe('POST', () => {
    test('should create quiz successfully with valid data', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.create as jest.Mock).mockResolvedValue({
        id: 'quiz-new',
        error: '',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        body: {
          quizName: 'Science Quiz',
          description: 'Basic Science',
          passMarkPercentage: 75,
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ id: 'quiz-new', error: '' });
      expect(controller.create).toHaveBeenCalledWith(
        {
          name: 'Science Quiz',
          description: 'Basic Science',
          passMarkPercentage: 75,
        },
        'user-123'
      );
    });

    test('should return 400 when user authentication fails on POST', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({
        error: 'Unauthorized',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        body: {
          quizName: 'Science Quiz',
          description: 'Basic Science',
          passMarkPercentage: 75,
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getResponseBody()).toBe('Unauthorized');
    });

    test('should return 200 with error when quiz creation fails', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.create as jest.Mock).mockResolvedValue({
        error: 'Quiz name already exists',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        body: {
          quizName: 'Existing Quiz',
          description: 'Description',
          passMarkPercentage: 50,
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'Quiz name already exists',
      });
    });

    test('should handle unexpected error with 500 status', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockRejectedValue(
        new Error('Database connection failed')
      );

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        body: {
          quizName: 'Test Quiz',
          description: 'Test',
          passMarkPercentage: 60,
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(500);
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
