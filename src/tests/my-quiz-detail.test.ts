import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, { controller } from '../pages/api/auth/my-quizzes/[quizId]';

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

describe('/api/auth/my-quizzes/[quizId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    test('should return quiz with details for authenticated user', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      const mockQuizDetails = {
        id: 'quiz-1',
        name: 'Math Quiz',
        description: 'Basic Math',
        questions: [],
      };

      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.getQuizWithDetails as jest.Mock).mockResolvedValue(
        mockQuizDetails
      );

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
        query: { quizId: 'quiz-1' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual(mockQuizDetails);
      expect(controller.getQuizWithDetails).toHaveBeenCalledWith(
        'quiz-1',
        'user-123'
      );
    });

    test('should return 400 when user authentication fails', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({
        error: 'Invalid token',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
        query: { quizId: 'quiz-1' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getResponseBody()).toBe('Invalid token');
    });

    test('should return error when quiz not found', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.getQuizWithDetails as jest.Mock).mockResolvedValue({
        error: 'Quiz not found',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
        query: { quizId: 'invalid-quiz' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Quiz not found' });
    });
  });

  describe('PUT', () => {
    test('should update quiz successfully with valid data', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.update as jest.Mock).mockResolvedValue({
        error: '',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PUT',
        query: { quizId: 'quiz-1' },
        body: {
          quizName: 'Updated Quiz',
          description: 'Updated Description',
          passMarkPercentage: 80,
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: '' });
      expect(controller.update).toHaveBeenCalledWith(
        {
          id: 'quiz-1',
          name: 'Updated Quiz',
          description: 'Updated Description',
          passMarkPercentage: 80,
        },
        'user-123'
      );
    });

    test('should return 400 when user authentication fails', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({
        error: 'Unauthorized',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PUT',
        query: { quizId: 'quiz-1' },
        body: {
          quizName: 'Updated Quiz',
          description: 'Updated Description',
          passMarkPercentage: 80,
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getResponseBody()).toBe('Unauthorized');
    });

    test('should return 200 with error when update fails', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.update as jest.Mock).mockResolvedValue({
        error: 'Quiz not found',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PUT',
        query: { quizId: 'invalid-quiz' },
        body: {
          quizName: 'Updated Quiz',
          description: 'Updated Description',
          passMarkPercentage: 80,
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Quiz not found' });
    });

    test('should handle authorization error', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-999' });
      (controller.update as jest.Mock).mockResolvedValue({
        error: 'User is not authorized to update this quiz',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PUT',
        query: { quizId: 'quiz-1' },
        body: {
          quizName: 'Updated Quiz',
          description: 'Updated Description',
          passMarkPercentage: 80,
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'User is not authorized to update this quiz',
      });
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
