const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const ThreadDetail = require("../../../Domains/threads/entities/ThreadDetail");
const CommentDetail = require("../../../Domains/comments/entities/CommentDetail");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrating the get thread detail action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const mockThread = {
      id: "thread-123",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
    };

    const mockComments = [
      {
        id: "comment-123",
        username: "johndoe",
        date: "2021-08-08T07:22:33.555Z",
        content: "sebuah comment",
        is_deleted: false,
      },
      {
        id: "comment-456",
        username: "dicoding",
        date: "2021-08-08T07:26:21.338Z",
        content: "sebuah comment lagi",
        is_deleted: true,
      },
    ];

    const mockReplies = [
      {
        id: "reply-123",
        content: "sebuah balasan",
        date: "2021-08-08T07:59:48.766Z",
        username: "johndoe",
        is_delete: false,
      },
      {
        id: "reply-456",
        content: "sebuah balasan yang dihapus",
        date: "2021-08-08T08:07:01.522Z",
        username: "dicoding",
        is_delete: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const expectedThreadDetail = new ThreadDetail({
      id: "thread-123",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
      comments: [
        new CommentDetail({
          id: "comment-123",
          username: "johndoe",
          date: "2021-08-08T07:22:33.555Z",
          content: "sebuah comment",
          isDeleted: false,
          replies: [
            {
              id: "reply-123",
              content: "sebuah balasan",
              date: "2021-08-08T07:59:48.766Z",
              username: "johndoe",
            },
            {
              id: "reply-456",
              content: "**balasan telah dihapus**",
              date: "2021-08-08T08:07:01.522Z",
              username: "dicoding",
            },
          ],
        }),
        new CommentDetail({
          id: "comment-456",
          username: "dicoding",
          date: "2021-08-08T07:26:21.338Z",
          content: "sebuah comment lagi",
          isDeleted: true,
          replies: [
            {
              id: "reply-123",
              content: "sebuah balasan",
              date: "2021-08-08T07:59:48.766Z",
              username: "johndoe",
            },
            {
              id: "reply-456",
              content: "**balasan telah dihapus**",
              date: "2021-08-08T08:07:01.522Z",
              username: "dicoding",
            },
          ],
        }),
      ],
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);

    expect(mockThreadRepository.getThreadById).toBeCalledWith("thread-123");
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      "thread-123"
    );
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      "comment-123"
    );
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      "comment-456"
    );
  });
});
