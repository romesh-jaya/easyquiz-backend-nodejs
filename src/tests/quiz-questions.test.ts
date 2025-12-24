import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, {
  controller,
} from '../pages/api/auth/my-quizzes/[quizId]/questions/index';

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
  '../common/infrastructure/postgres/controllers/postgres-question-controller'
);

describe('/api/auth/my-quizzes/[quizId]/questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    test('should create quiz question successfully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.create as jest.Mock).mockResolvedValue({
        id: 'q-new',
        error: '',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: {
          questionContent: 'What is 2+2?',
          answers: [
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
          ],
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ id: 'q-new', error: '' });
      expect(controller.create).toHaveBeenCalledWith(
        {
          quizId: 'quiz-1',
          questionContent: 'What is 2+2?',
          answers: [
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
          ],
        },
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
        body: {
          questionContent: 'What is 2+2?',
          answers: [],
        },
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
      (controller.create as jest.Mock).mockResolvedValue({
        error: 'Quiz not found',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'invalid-quiz' },
        body: {
          questionContent: 'What is 2+2?',
          answers: [],
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Quiz not found' });
    });

    test('should return 200 with error when question content is empty', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.create as jest.Mock).mockResolvedValue({
        error: 'Question content cannot be empty',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: {
          questionContent: '',
          answers: [],
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'Question content cannot be empty',
      });
    });

    test('should return 200 with error when no answers provided', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.create as jest.Mock).mockResolvedValue({
        error: 'At least one answer is required',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: {
          questionContent: 'What is 2+2?',
          answers: [],
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'At least one answer is required',
      });
    });

    test('should handle duplicate question error', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.create as jest.Mock).mockResolvedValue({
        error: 'Question with identical content already exists',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'POST',
        query: { quizId: 'quiz-1' },
        body: {
          questionContent: 'What is 2+2?',
          answers: [],
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'Question with identical content already exists',
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
