class HealthHandler {
  async getHealthHandler() {
    return {
      status: "success",
      data: {
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
      },
    };
  }
}

module.exports = HealthHandler;
