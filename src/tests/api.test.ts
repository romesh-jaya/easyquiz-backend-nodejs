import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler from '../pages/api';

describe('/api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    test('should return 200 with "Server is up" message', async () => {
      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'GET',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getResponseBody()).toBe('Server is up');
    });
  });
});
