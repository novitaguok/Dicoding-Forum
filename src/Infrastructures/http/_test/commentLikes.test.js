const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads/{threadId}/comments/{commentId}/likes endpoint", () => {
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

  describe("when PUT /threads/{threadId}/comments/{commentId}/likes", () => {
    it("should response 200 and like the comment", async () => {
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

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Action - like the comment
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");

      // Verify like was added
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(
        addedComment.id
      );
      expect(likes).toHaveLength(1);
    });

    it("should response 200 and unlike the comment when already liked", async () => {
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

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action - unlike the comment
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");

      // Verify like was removed
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(
        addedComment.id
      );
      expect(likes).toHaveLength(0);
    });

    it("should response 401 when request not contain access token", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/threads/thread-123/comments/comment-123/likes",
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it("should response 404 when thread not found", async () => {
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

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/threads/thread-xxx/comments/comment-123/likes",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it("should response 404 when comment not found", async () => {
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

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/comment-xxx/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("GET /threads/{threadId} with likes", () => {
    it("should return thread detail with like counts", async () => {
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

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "johndoe",
          password: "secret",
          fullname: "John Doe",
        },
      });

      // login first user
      const loginResponse1 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "dicoding",
          password: "secret",
        },
      });

      const {
        data: { accessToken: accessToken1 },
      } = JSON.parse(loginResponse1.payload);

      // login second user
      const loginResponse2 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "johndoe",
          password: "secret",
        },
      });

      const {
        data: { accessToken: accessToken2 },
      } = JSON.parse(loginResponse2.payload);

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Thread Title",
          body: "Thread body content",
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(threadResponse.payload);

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "Comment content",
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const {
        data: { addedComment },
      } = JSON.parse(commentResponse.payload);

      // Both users like the comment
      await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Action - get thread detail
      const response = await server.inject({
        method: "GET",
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(2);
    });
  });
});
