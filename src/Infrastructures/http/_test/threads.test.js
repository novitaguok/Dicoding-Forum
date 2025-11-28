const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and persisted thread", async () => {
      // Arrange
      const requestPayload = {
        title: "Thread Title",
        body: "Thread body content",
      };

      const server = await createServer(container);

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const { data: loginData } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        body: "Thread body content",
      };

      const server = await createServer(container);

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const { data: loginData } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should response 401 when request not contain access token", async () => {
      // Arrange
      const requestPayload = {
        title: "Thread Title",
        body: "Thread body content",
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe("when GET /threads/{threadId}", () => {
    it("should response 200 and return thread detail", async () => {
      // Arrange
      const server = await createServer(container);

      const userPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });

      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const { data: loginData } = JSON.parse(loginResponse.payload);

      const threadPayload = {
        title: "Thread Title",
        body: "Thread body content",
      };

      const addThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      // Action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(addedThread.id);
      expect(responseJson.data.thread.title).toEqual(threadPayload.title);
      expect(responseJson.data.thread.body).toEqual(threadPayload.body);
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toEqual(userPayload.username);
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(Array.isArray(responseJson.data.thread.comments)).toBeTruthy();
    });

    it("should response 404 when thread not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-999",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
  });
});
