import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, {
  controller,
} from '../pages/api/auth/my-quizzes/[quizId]/invite-quiz-taker';

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

describe('/api/auth/my-quizzes/[quizId]/invite-quiz-taker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    test('should invite quiz taker successfully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.inviteQuizTaker as jest.Mock).mockResolvedValue({
        error: '',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { quizTaker: 'student@example.com' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: '' });
      expect(controller.inviteQuizTaker).toHaveBeenCalledWith(
        'quiz-1',
        'student@example.com',
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
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { quizTaker: 'student@example.com' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getResponseBody()).toBe('Unauthorized');
    });

    test('should return 200 with error when quiz not found', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.inviteQuizTaker as jest.Mock).mockResolvedValue({
        error: 'Quiz not found',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'invalid-quiz' },
        body: { quizTaker: 'student@example.com' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Quiz not found' });
    });

    test('should return 200 with error when quiz taker email is invalid', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.inviteQuizTaker as jest.Mock).mockResolvedValue({
        error: 'Invalid email address',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { quizTaker: 'invalid-email' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Invalid email address' });
    });

    test('should return 200 with error when user not authorized', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-456' });
      (controller.inviteQuizTaker as jest.Mock).mockResolvedValue({
        error: 'Only quiz owner can invite takers',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { quizTaker: 'student@example.com' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'Only quiz owner can invite takers',
      });
    });

    test('should handle quiz already taken by user error', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.inviteQuizTaker as jest.Mock).mockResolvedValue({
        error: 'User already invited to this quiz',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { quizTaker: 'student@example.com' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'User already invited to this quiz',
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
