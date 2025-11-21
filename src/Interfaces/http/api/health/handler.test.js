const HealthHandler = require('./handler');

describe('HealthHandler', () => {
  it('should return success status and message', async () => {
    // Arrange
    const healthHandler = new HealthHandler();

    // Action
    const response = await healthHandler.getHealthHandler();

    // Assert
    expect(response.status).toEqual('success');
    expect(response.data.message).toEqual('Server is healthy');
    expect(response.data.timestamp).toBeDefined();
  });

  it('should return timestamp in ISO format', async () => {
    // Arrange
    const healthHandler = new HealthHandler();

    // Action
    const response = await healthHandler.getHealthHandler();

    // Assert
    const timestamp = new Date(response.data.timestamp);
    expect(timestamp.toISOString()).toEqual(response.data.timestamp);
  });
});
