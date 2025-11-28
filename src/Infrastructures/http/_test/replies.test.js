const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads/{threadId}/comments/{commentId}/replies endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
    it("should response 201 and persisted reply", async () => {
      // Arrange
      const requestPayload = {
        content: "Reply content",
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

      const addThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(
        requestPayload.content
      );
      expect(responseJson.data.addedReply.owner).toBeDefined();
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {};

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

      const addThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
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
        content: "Reply content",
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads/thread-123/comments/comment-123/replies",
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it("should response 404 when comment not found", async () => {
      // Arrange
      const requestPayload = {
        content: "Reply content",
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

      const addThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/comment-999/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    it("should response 200 when reply successfully deleted", async () => {
      // Arrange
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

      const addThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      const addReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedReply },
      } = JSON.parse(addReplyResponse.payload);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 401 when request not contain access token", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/threads/thread-123/comments/comment-123/replies/reply-123",
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it("should response 403 when user not owner of reply", async () => {
      // Arrange
      const server = await createServer(container);

      // add user 1
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      // add user 2
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "john",
          password: "secret",
          fullname: "John Doe",
        },
      });

      // login user 1
      const loginResponse1 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      // login user 2
      const loginResponse2 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "john",
          password: "secret",
        },
      });

      const { data: loginData1 } = JSON.parse(loginResponse1.payload);
      const { data: loginData2 } = JSON.parse(loginResponse2.payload);

      // add thread by user 1
      const addThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${loginData1.accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      // add comment by user 1
      const addCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${loginData1.accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      // add reply by user 1
      const addReplyResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: "Reply content",
        },
        headers: {
          Authorization: `Bearer ${loginData1.accessToken}`,
        },
      });

      const {
        data: { addedReply },
      } = JSON.parse(addReplyResponse.payload);

      // Action - try to delete reply by user 2
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${loginData2.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should response 404 when reply not found", async () => {
      // Arrange
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

      const addThreadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(addThreadResponse.payload);

      const addCommentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/reply-999`,
        headers: {
          Authorization: `Bearer ${loginData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
  });
});
