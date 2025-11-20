const createServer = require('../createServer');

describe('HTTP server', () => {
  describe('when GET /health', () => {
    it('should return 200 and health status', async () => {
      // Arrange
      const server = await createServer({});

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.message).toEqual('Server is healthy');
      expect(responseJson.data.timestamp).toBeDefined();
    });
  });
});
