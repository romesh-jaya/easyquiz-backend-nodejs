import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler from '../pages/api/index';

describe('/api/index', () => {
  test('should return `Server is up` text on GET request', async () => {
    const res = new MockVercelResponse();
    const req = new MockVercelRequest();

    // Act
    await handler(req, res);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.getResponseBody()).toEqual(`Server is up`);
  });
});
