const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const RegisterComment = require("../../../Domains/comments/entities/RegisterComment");
const RegisteredComment = require("../../../Domains/comments/entities/RegisteredComment");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist add comment and return registered comment correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const registerComment = new RegisterComment({
        content: "sebuah comment",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(
        registerComment,
        "thread-123",
        "user-123"
      );

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById(
        "comment-123"
      );
      expect(comment).toHaveLength(1);
    });

    it("should return registered comment correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const registerComment = new RegisterComment({
        content: "sebuah comment",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const registeredComment = await commentRepositoryPostgres.addComment(
        registerComment,
        "thread-123",
        "user-123"
      );

      // Assert
      expect(registeredComment).toStrictEqual(
        new RegisteredComment({
          id: "comment-123",
          content: "sebuah comment",
          owner: "user-123",
        })
      );
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return comments correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "sebuah comment",
        threadId: "thread-123",
        owner: "user-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        "thread-123"
      );

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual("comment-123");
      expect(comments[0].username).toEqual("dicoding");
      expect(comments[0].content).toEqual("sebuah comment");
      expect(comments[0].date).toEqual("2021-08-08T07:22:33.555Z");
      expect(comments[0].is_deleted).toEqual(false);
    });
  });

  describe("deleteComment function", () => {
    it("should soft delete comment correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "sebuah comment",
        threadId: "thread-123",
        owner: "user-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment("comment-123");

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById(
        "comment-123"
      );
      expect(comment[0].is_deleted).toEqual(true);
    });
  });

  describe("verifyCommentExists function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists("comment-123")
      ).rejects.toThrow(new NotFoundError("komentar tidak ditemukan"));
    });

    it("should not throw NotFoundError when comment found", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "sebuah comment",
        threadId: "thread-123",
        owner: "user-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists("comment-123")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw AuthorizationError when comment not found", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-123")
      ).rejects.toThrow(
        new AuthorizationError("Anda tidak berhak mengakses resource ini")
      );
    });

    it("should throw AuthorizationError when user is not the comment owner", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await UsersTableTestHelper.addUser({
        id: "user-456",
        username: "johndoe",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "sebuah comment",
        threadId: "thread-123",
        owner: "user-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-456")
      ).rejects.toThrow(
        new AuthorizationError("Anda tidak berhak mengakses resource ini")
      );
    });

    it("should not throw AuthorizationError when user is the comment owner", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "sebuah comment",
        threadId: "thread-123",
        owner: "user-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-123")
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });
});
