import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, {
  controller,
} from '../pages/api/auth/my-quizzes/[quizId]/update-question-order';

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

describe('/api/auth/my-quizzes/[quizId]/update-question-order', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    test('should update question order successfully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      const questionOrder = ['q-2', 'q-1', 'q-3'];

      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.updateQuestionOrder as jest.Mock).mockResolvedValue({
        error: '',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { questionOrder },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: '' });
      expect(controller.updateQuestionOrder).toHaveBeenCalledWith(
        'quiz-1',
        questionOrder,
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
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { questionOrder: ['q-1', 'q-2'] },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getResponseBody()).toBe('Invalid token');
    });

    test('should return 200 with error when quiz not found', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.updateQuestionOrder as jest.Mock).mockResolvedValue({
        error: 'Quiz not found',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'invalid-quiz' },
        body: { questionOrder: ['q-1'] },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Quiz not found' });
    });

    test('should return 200 with error when question order is invalid', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.updateQuestionOrder as jest.Mock).mockResolvedValue({
        error: 'Invalid question IDs in order',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { questionOrder: ['invalid-id'] },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'Invalid question IDs in order',
      });
    });

    test('should handle authorization error', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-999' });
      (controller.updateQuestionOrder as jest.Mock).mockResolvedValue({
        error: 'User does not have permission to update this quiz',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: { questionOrder: ['q-1', 'q-2'] },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'User does not have permission to update this quiz',
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
