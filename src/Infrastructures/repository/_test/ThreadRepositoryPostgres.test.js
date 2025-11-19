const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const RegisterThread = require("../../../Domains/threads/entities/RegisterThread");
const RegisteredThread = require("../../../Domains/threads/entities/RegisteredThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist add thread and return registered thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      const registerThread = new RegisterThread({
        title: "sebuah thread",
        body: "sebuah body thread",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepositoryPostgres.addThread(registerThread, "user-123");

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadsById("thread-123");
      expect(thread).toHaveLength(1);
    });

    it("should return registered thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      const registerThread = new RegisterThread({
        title: "sebuah thread",
        body: "sebuah body thread",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const registeredThread = await threadRepositoryPostgres.addThread(
        registerThread,
        "user-123"
      );

      // Assert
      expect(registeredThread).toStrictEqual(
        new RegisteredThread({
          id: "thread-123",
          title: "sebuah thread",
          owner: "user-123",
        })
      );
    });
  });

  describe("getThreadById function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.getThreadById("thread-123")
      ).rejects.toThrow(new NotFoundError("thread tidak ditemukan"));
    });

    it("should return thread detail correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        owner: "user-123",
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetail = await threadRepositoryPostgres.getThreadById(
        "thread-123"
      );

      // Assert
      expect(threadDetail.id).toEqual("thread-123");
      expect(threadDetail.title).toEqual("sebuah thread");
      expect(threadDetail.body).toEqual("sebuah body thread");
      expect(threadDetail.username).toEqual("dicoding");
      expect(threadDetail.date).toEqual("2021-08-08T07:19:09.775Z");
    });
  });

  describe("verifyThreadExists function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists("thread-123")
      ).rejects.toThrow(new NotFoundError("thread tidak ditemukan"));
    });

    it("should not throw NotFoundError when thread found", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        owner: "user-123",
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists("thread-123")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
