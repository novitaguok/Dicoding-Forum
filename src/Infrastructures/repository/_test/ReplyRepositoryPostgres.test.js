const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RegisterReply = require("../../../Domains/replies/entities/RegisterReply");
const RegisteredReply = require("../../../Domains/replies/entities/RegisteredReply");
const pool = require("../../database/postgres/pool");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist reply and return registered reply correctly", async () => {
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
        threadId: "thread-123",
        owner: "user-123",
      });

      const registerReply = new RegisterReply({
        content: "sebuah balasan",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const registeredReply = await replyRepositoryPostgres.addReply(
        registerReply,
        "thread-123",
        "comment-123",
        "user-123"
      );

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById("reply-123");
      expect(replies).toHaveLength(1);
      expect(registeredReply).toStrictEqual(
        new RegisteredReply({
          id: "reply-123",
          content: "sebuah balasan",
          owner: "user-123",
        })
      );
    });
  });

  describe("verifyReplyExists function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists("reply-123")
      ).rejects.toThrow(new NotFoundError("balasan tidak ditemukan"));
    });

    it("should not throw error when reply exists", async () => {
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
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists("reply-123")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should throw AuthorizationError when reply not owned by user", async () => {
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
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-456")
      ).rejects.toThrow(
        new AuthorizationError("Anda tidak berhak mengakses resource ini")
      );
    });

    it("should not throw error when reply owned by user", async () => {
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
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-123")
      ).resolves.not.toThrowError(NotFoundError);
      await expect(
        replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-123")
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("deleteReply function", () => {
    it("should soft delete reply correctly", async () => {
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
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply("reply-123");

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById("reply-123");
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return replies correctly", async () => {
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
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
        content: "sebuah balasan",
        date: "2021-08-08T07:59:48.766Z",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-456",
        commentId: "comment-123",
        owner: "user-456",
        content: "balasan lainnya",
        date: "2021-08-08T08:07:01.522Z",
        isDelete: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        "comment-123"
      );

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0]).toStrictEqual({
        id: "reply-123",
        content: "sebuah balasan",
        date: "2021-08-08T07:59:48.766Z",
        username: "dicoding",
        is_delete: false,
      });
      expect(replies[1]).toStrictEqual({
        id: "reply-456",
        content: "balasan lainnya",
        date: "2021-08-08T08:07:01.522Z",
        username: "johndoe",
        is_delete: true,
      });
    });
  });
});
