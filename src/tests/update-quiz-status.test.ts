import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, {
  controller,
} from '../pages/api/auth/my-quizzes/[quizId]/update-quiz-status';

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

describe('/api/auth/my-quizzes/[quizId]/update-quiz-status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    test('should update quiz status successfully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.updateQuizStatus as jest.Mock).mockResolvedValue({
        error: '',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { status: 'ACTIVE' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: '' });
      expect(controller.updateQuizStatus).toHaveBeenCalledWith(
        'quiz-1',
        'ACTIVE',
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
        body: { status: 'ACTIVE' },
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
      (controller.updateQuizStatus as jest.Mock).mockResolvedValue({
        error: 'Quiz not found',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'invalid-quiz' },
        body: { status: 'ACTIVE' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Quiz not found' });
    });

    test('should return 200 with error for invalid status', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.updateQuizStatus as jest.Mock).mockResolvedValue({
        error: 'Invalid status provided',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { status: 'INVALID_STATUS' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'Invalid status provided',
      });
    });

    test('should handle permission error when user is not owner', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-456' });
      (controller.updateQuizStatus as jest.Mock).mockResolvedValue({
        error: 'Only quiz owner can update status',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { status: 'INACTIVE' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'Only quiz owner can update status',
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
