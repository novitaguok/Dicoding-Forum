require("dotenv").config();
const createServer = require("./src/Infrastructures/http/createServer");
const container = require("./src/Infrastructures/container");

(async () => {
  try {
    console.log("Environment variables:");
    console.log("HOST:", process.env.HOST);
    console.log("PORT:", process.env.PORT);
    console.log("PGHOST:", process.env.PGHOST);
    console.log("PGUSER:", process.env.PGUSER);
    console.log("PGDATABASE:", process.env.PGDATABASE);

    console.log("Creating server...");
    const server = await createServer(container);

    console.log("Starting server...");
    await server.start();

    console.log(`server start at ${server.info.uri}`);

    // Keep the server running
    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
})();
