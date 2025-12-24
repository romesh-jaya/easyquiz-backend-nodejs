import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, {
  controller,
} from '../pages/api/auth/my-quizzes/[quizId]/questions/[questionId]';

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

describe('/api/auth/my-quizzes/[quizId]/questions/[questionId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT', () => {
    test('should update quiz question successfully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.update as jest.Mock).mockResolvedValue({
        error: '',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PUT',
        query: { quizId: 'quiz-1', questionId: 'q-1' },
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
      expect(res.getResponseBody()).toEqual({ error: '' });
      expect(controller.update).toHaveBeenCalledWith(
        {
          id: 'q-1',
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
        method: 'PUT',
        query: { quizId: 'quiz-1', questionId: 'q-1' },
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

    test('should return 200 with error when question not found', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.update as jest.Mock).mockResolvedValue({
        error: 'Question not found',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PUT',
        query: { quizId: 'quiz-1', questionId: 'invalid-q' },
        body: {
          questionContent: 'Updated Question',
          answers: [],
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Question not found' });
    });

    test('should return 200 with error when answers are invalid', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.update as jest.Mock).mockResolvedValue({
        error: 'At least one correct answer is required',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PUT',
        query: { quizId: 'quiz-1', questionId: 'q-1' },
        body: {
          questionContent: 'What is 2+2?',
          answers: [{ text: '4', isCorrect: false }],
        },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'At least one correct answer is required',
      });
    });

    test('should handle authorization error on update', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-999' });
      (controller.update as jest.Mock).mockResolvedValue({
        error: 'User is not authorized to update this question',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PUT',
        query: { quizId: 'quiz-1', questionId: 'q-1' },
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
        error: 'User is not authorized to update this question',
      });
    });
  });

  describe('DELETE', () => {
    test('should delete quiz question successfully', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.delete as jest.Mock).mockResolvedValue({
        error: '',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'DELETE',
        query: { quizId: 'quiz-1', questionId: 'q-1' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: '' });
      expect(controller.delete).toHaveBeenCalledWith('q-1', 'user-123');
    });

    test('should return 400 when user authentication fails', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({
        error: 'Unauthorized',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'DELETE',
        query: { quizId: 'quiz-1', questionId: 'q-1' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getResponseBody()).toBe('Unauthorized');
    });

    test('should return 200 with error when question not found', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-123' });
      (controller.delete as jest.Mock).mockResolvedValue({
        error: 'Question not found',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'DELETE',
        query: { quizId: 'quiz-1', questionId: 'invalid-q' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({ error: 'Question not found' });
    });

    test('should handle authorization error on delete', async () => {
      const { getUserIDFromAuthToken } = require('../common/utils/auth');
      getUserIDFromAuthToken.mockResolvedValue({ userId: 'user-999' });
      (controller.delete as jest.Mock).mockResolvedValue({
        error: 'User is not authorized to delete this question',
      });

      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'DELETE',
        query: { quizId: 'quiz-1', questionId: 'q-1' },
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toEqual({
        error: 'User is not authorized to delete this question',
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
