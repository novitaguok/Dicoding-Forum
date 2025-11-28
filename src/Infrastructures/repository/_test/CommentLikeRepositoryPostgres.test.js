const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentLikeRepositoryPostgres = require("../CommentLikeRepositoryPostgres");

describe("CommentLikeRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addLike function", () => {
    it("should persist like and return correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
      });

      const fakeIdGenerator = () => "123";
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentLikeRepositoryPostgres.addLike("comment-123", "user-123");

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(
        "comment-123"
      );
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toEqual("like-123");
      expect(likes[0].comment_id).toEqual("comment-123");
      expect(likes[0].owner).toEqual("user-123");
    });
  });

  describe("deleteLike function", () => {
    it("should delete like correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      // Action
      await commentLikeRepositoryPostgres.deleteLike("comment-123", "user-123");

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(
        "comment-123"
      );
      expect(likes).toHaveLength(0);
    });
  });

  describe("verifyLikeExists function", () => {
    it("should return true when like exists", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      // Action
      const exists = await commentLikeRepositoryPostgres.verifyLikeExists(
        "comment-123",
        "user-123"
      );

      // Assert
      expect(exists).toEqual(true);
    });

    it("should return false when like does not exist", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      // Action
      const exists = await commentLikeRepositoryPostgres.verifyLikeExists(
        "comment-123",
        "user-123"
      );

      // Assert
      expect(exists).toEqual(false);
    });
  });

  describe("getLikeCountByCommentId function", () => {
    it("should return correct like count", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await UsersTableTestHelper.addUser({ id: "user-456", username: "user2" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-123",
        owner: "user-123",
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-456",
        commentId: "comment-123",
        owner: "user-456",
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      // Action
      const count = await commentLikeRepositoryPostgres.getLikeCountByCommentId(
        "comment-123"
      );

      // Assert
      expect(count).toEqual(2);
    });

    it("should return 0 when no likes", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      // Action
      const count = await commentLikeRepositoryPostgres.getLikeCountByCommentId(
        "comment-123"
      );

      // Assert
      expect(count).toEqual(0);
    });
  });

  describe("getLikeCountsByThreadId function", () => {
    it("should return correct like counts for all comments in thread", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await UsersTableTestHelper.addUser({ id: "user-456", username: "user2" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-456",
        threadId: "thread-123",
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-123",
        owner: "user-123",
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-456",
        commentId: "comment-123",
        owner: "user-456",
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-789",
        commentId: "comment-456",
        owner: "user-123",
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      // Action
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByThreadId(
        "thread-123"
      );

      // Assert
      expect(likeCounts["comment-123"]).toEqual(2);
      expect(likeCounts["comment-456"]).toEqual(1);
    });

    it("should return empty object when no likes in thread", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      // Action
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByThreadId(
        "thread-123"
      );

      // Assert
      expect(likeCounts).toEqual({});
    });
  });
});
