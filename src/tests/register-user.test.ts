import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler, { controller } from '../pages/api/public/users/register-user';

// Mock the controller
jest.mock(
  '../common/infrastructure/postgres/controllers/postgres-user-controller'
);

// Mock Firebase
jest.mock('../common/infrastructure/firebase', () => ({
  auth: {
    getUserByEmail: jest.fn(),
    deleteUser: jest.fn(),
    createUser: jest.fn(),
  },
}));

// Mock CORS middleware
jest.mock('../common/infrastructure/express/middleware/cors', () => ({
  runCorsMiddleware: jest.fn((req, res) => Promise.resolve()),
}));

describe('/api/public/users/register-user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 when password is empty', async () => {
    const res = new MockVercelResponse();
    const req = new MockVercelRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: '',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Act
    await handler(req, res);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.getResponseBody()).toEqual(
      'Error: password was found to be empty'
    );
  });

  test('should return 200 with error when controller fails', async () => {
    const mockError = { error: 'User already exists', isGeneralError: false };
    (controller.create as jest.Mock).mockResolvedValue(mockError);

    const res = new MockVercelResponse();
    const req = new MockVercelRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Act
    await handler(req, res);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.getResponseBody()).toEqual(mockError);
  });

  test('should return 200 with success when user is registered', async () => {
    (controller.create as jest.Mock).mockResolvedValue({ error: '' });
    const { auth } = require('../common/infrastructure/firebase');
    auth.getUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });
    auth.createUser.mockResolvedValue({});

    const res = new MockVercelResponse();
    const req = new MockVercelRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Act
    await handler(req, res);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.getResponseBody()).toEqual({ error: '' });
    expect(controller.create).toHaveBeenCalled();
  });

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

  test('should return 200 with error when Firebase auth creation fails', async () => {
    (controller.create as jest.Mock).mockResolvedValue({ error: '' });
    const { auth } = require('../common/infrastructure/firebase');
    auth.getUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });
    auth.createUser.mockRejectedValue({ message: 'Firebase error' });

    const res = new MockVercelResponse();
    const req = new MockVercelRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    // Act
    await handler(req, res);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.getResponseBody()).toEqual({
      error: 'Unknown error occured while trying to signup',
      isGeneralError: false,
    });
  });
});
