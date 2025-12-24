import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, { controller } from '../pages/api/auth/others-quizzes/index';

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

describe('/api/auth/others-quizzes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    test('should return list of other users quizzes without correct answers', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      const mockQuizzes = [
        {
          id: 'quiz-1',
          name: 'Someone Else Quiz',
          description: 'Quiz by other user',
          questions: [{ id: 'q1', content: 'Question 1', answers: [] }],
        },
      ];

      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (
        controller.getOthersQuizzesWithoutCorrectAnswersForUser as jest.Mock
      ).mockResolvedValue(mockQuizzes);

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual(mockQuizzes);
      expect(
        controller.getOthersQuizzesWithoutCorrectAnswersForUser
      ).toHaveBeenCalledWith('user-123');
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

    test('should return empty array when no quizzes available', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (
        controller.getOthersQuizzesWithoutCorrectAnswersForUser as jest.Mock
      ).mockResolvedValue([]);

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual([]);
    });

    test('should handle controller error gracefully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (
        controller.getOthersQuizzesWithoutCorrectAnswersForUser as jest.Mock
      ).mockResolvedValue({ error: 'Database error' });

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
